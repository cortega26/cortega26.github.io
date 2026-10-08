import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { business, hardLaunchIssues } from "./src/config.ts";
import { existsSync } from "node:fs";

const release = process.env.SUPPORT_RELEASE === "1";
// Only hard blockers stop a release build; soft/post-launch items are reported
// by `npm run support:release-check` so GA4 cannot hold back a publication.
if (release && hardLaunchIssues().length)
  throw new Error(`Support launch blocked:\n${hardLaunchIssues().join("\n- ")}`);
if (release && business.photo && !existsSync(new URL(business.photo, import.meta.url)))
  throw new Error(`Support launch blocked: portrait file missing (${business.photo})`);

export default defineConfig({
  site: business.origin,
  output: "static",
  trailingSlash: "always",
  integrations: release ? [sitemap({ filter: (page) => !new URL(page).pathname.startsWith("/flyer/") })] : [],
  vite: { define: { __SUPPORT_RELEASE__: JSON.stringify(release) } },
});
