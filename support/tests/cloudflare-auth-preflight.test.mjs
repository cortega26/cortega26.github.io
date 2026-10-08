import { test } from "node:test";
import assert from "node:assert/strict";

// No network or Cloudflare credentials: import the preflight separately for
// each scenario and replace fetch with a deterministic stub.
let scenario = 0;
const okResponse = (status, success, result = null, errors = []) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => ({ success, result, errors }),
});

async function runCase({ token = "test-api-token", accountId = "a".repeat(32), responder }) {
  const original = {
    token: process.env.CLOUDFLARE_API_TOKEN,
    account: process.env.CLOUDFLARE_ACCOUNT_ID,
    summary: process.env.GITHUB_STEP_SUMMARY,
    fetch: globalThis.fetch,
    log: console.log,
    error: console.error,
    exit: process.exitCode,
  };
  process.env.CLOUDFLARE_API_TOKEN = token;
  process.env.CLOUDFLARE_ACCOUNT_ID = accountId;
  delete process.env.GITHUB_STEP_SUMMARY;
  const messages = [];
  let calls = 0;
  console.log = (text) => messages.push(String(text));
  console.error = (text) => messages.push(String(text));
  globalThis.fetch = async (url, options) => {
    calls += 1;
    assert.equal(options.headers.Authorization, `Bearer ${token}`);
    return responder(String(url), calls);
  };
  process.exitCode = 0;
  try {
    await import(`../scripts/cloudflare-auth-preflight.mjs?scenario=${scenario++}`);
    return { code: process.exitCode, messages: messages.join("\n"), calls };
  } finally {
    process.env.CLOUDFLARE_API_TOKEN = original.token ?? "";
    process.env.CLOUDFLARE_ACCOUNT_ID = original.account ?? "";
    if (original.summary === undefined) delete process.env.GITHUB_STEP_SUMMARY;
    else process.env.GITHUB_STEP_SUMMARY = original.summary;
    globalThis.fetch = original.fetch;
    console.log = original.log;
    console.error = original.error;
    process.exitCode = original.exit;
  }
}

test("Cloudflare preflight succeeds only when the existing Pages project is accessible", async () => {
  const out = await runCase({ responder: () => okResponse(200, true, { name: "tooltician-support" }) });
  assert.equal(out.code, 0);
  assert.equal(out.calls, 1);
  assert.match(out.messages, /confirmed read access/);
  assert.doesNotMatch(out.messages, /test-api-token|aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/);
});

test("Cloudflare preflight distinguishes valid token from inaccessible Pages project", async () => {
  const out = await runCase({
    responder: (url) => url.includes("/user/tokens/verify")
      ? okResponse(200, true, { status: "active" })
      : okResponse(403, false, null, [{ code: 10000 }]),
  });
  assert.equal(out.code, 1);
  assert.equal(out.calls, 2);
  assert.match(out.messages, /Token verified active: yes/);
  assert.match(out.messages, /cannot read the Pages project/);
  assert.match(out.messages, /10000/);
  assert.doesNotMatch(out.messages, /test-api-token|aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/);
});

test("Cloudflare preflight catches incorrectly stored Account IDs without a request", async () => {
  const out = await runCase({
    accountId: "not-an-account-id",
    responder: () => { throw new Error("must not call API"); },
  });
  assert.equal(out.code, 1);
  assert.equal(out.calls, 0);
  assert.match(out.messages, /32-character hexadecimal/);
});

test("Cloudflare preflight reports a nonverified token separately", async () => {
  const out = await runCase({
    responder: () => okResponse(403, false, null, [{ code: 10000 }]),
  });
  assert.equal(out.code, 1);
  assert.equal(out.calls, 3);
  assert.match(out.messages, /not confirmed/);
  assert.match(out.messages, /active API TOKEN/);
});

test("Cloudflare preflight detects wrong account or project", async () => {
  const out = await runCase({
    responder: () => okResponse(404, false, null, [{ code: 8000007 }]),
  });
  assert.equal(out.code, 1);
  assert.match(out.messages, /Project not found under this Account ID/);
});
