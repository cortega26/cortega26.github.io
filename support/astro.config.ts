import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { business, launchIssues } from "./src/config.ts";
import { existsSync } from "node:fs";

const release = process.env.SUPPORT_RELEASE === "1";
if (release && launchIssues().length)
  throw new Error(`Support launch blocked:\n${launchIssues().join("\n")}`);
if (
  release &&
  (!business.photo.startsWith("/") ||
    !existsSync(new URL(`./public${business.photo}`, import.meta.url)))
)
  throw new Error("Support launch blocked: portrait file missing");

export default defineConfig({
  site: business.origin,
  output: "static",
  trailingSlash: "always",
  integrations: release ? [sitemap()] : [],
  vite: { define: { __SUPPORT_RELEASE__: JSON.stringify(release) } },
});
