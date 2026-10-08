// Cloudflare CI authentication preflight. Never print token, account ID,
// Authorization header, URL containing account ID, or raw Cloudflare responses.
// This checks read access to the existing Pages project before npm ci/build.
import { appendFileSync } from "node:fs";

const projectName = "tooltician-support";
const token = process.env.CLOUDFLARE_API_TOKEN ?? "";
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

function note(message) {
  console.log(message);
  if (summaryPath) appendFileSync(summaryPath, `${message}\n`);
}

function fail(message) {
  console.error(`::error::${message}`);
  if (summaryPath) appendFileSync(summaryPath, `**Cloudflare authentication blocked:** ${message}\n`);
  process.exitCode = 1;
}

function credentialFormat() {
  if (!token || !accountId) return "Both GitHub Actions secrets must be present.";
  if (token !== token.trim()) return "API token has leading or trailing whitespace. Replace the GitHub secret with the exact token value.";
  if (accountId !== accountId.trim()) return "Account ID has leading or trailing whitespace. Correct its GitHub secret.";
  if (!/^[a-f0-9]{32}$/i.test(accountId)) return "Account ID must be a 32-character hexadecimal Cloudflare Account ID (not a Zone ID or token ID).";
  return null;
}

async function check(path) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });
  let result;
  try { result = await response.json(); } catch { result = null; }
  const codes = Array.isArray(result?.errors)
    ? result.errors.map((e) => Number(e?.code)).filter((v) => Number.isInteger(v))
    : [];
  return {
    ok: response.ok && result?.success === true,
    status: response.status,
    codes,
    tokenStatus: typeof result?.result?.status === "string" ? result.result.status : null,
  };
}

async function main() {
  const formatProblem = credentialFormat();
  if (formatProblem) return fail(formatProblem);

  let project;
  try {
    project = await check(`accounts/${accountId}/pages/projects/${projectName}`);
  } catch {
    return fail("Could not contact Cloudflare API to check the existing Pages project. Check connectivity and retry.");
  }
  if (project.ok) {
    note("Cloudflare authentication: confirmed read access to existing Pages project. Proceeding to build and deploy.");
    return;
  }

  // A 10000 from Pages is not proof that the API token is invalid: a valid
  // token with missing Pages permissions or a different Account ID can fail.
  let verified = false;
  try {
    const user = await check("user/tokens/verify");
    if (user.ok && user.tokenStatus === "active") verified = true;
    if (!verified) {
      const account = await check(`accounts/${accountId}/tokens/verify`);
      verified = account.ok && account.tokenStatus === "active";
    }
  } catch { /* Token verification may be unavailable or restricted. */ }

  const code = project.codes.length ? project.codes.join(",") : "none";
  note(`Cloudflare Pages project check: HTTP ${project.status}; error code(s): ${code}. Token verified active: ${verified ? "yes" : "not confirmed"}.`);
  if (project.status === 404) {
    return fail("Project not found under this Account ID. Check the Cloudflare account containing 'tooltician-support'.");
  }
  if (project.status === 429) {
    return fail("Cloudflare API rate-limited this check. Retry later; do not rotate the token based on this response.");
  }
  if (verified) {
    return fail("Token is active but cannot read the Pages project. Check Account > Cloudflare Pages > Edit for the correct account, plus any resource/IP restrictions and Account Settings > Read if needed.");
  }
  return fail("Cloudflare did not confirm a valid token for this project. Verify that the GitHub secret contains an active API TOKEN (not a token ID or Global API Key), with Cloudflare Pages Edit on the correct Account ID.");
}

await main();
