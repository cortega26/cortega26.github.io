import { business } from "../config";
export const GET = () =>
  new Response(
    __SUPPORT_RELEASE__
      ? `User-agent: *\nAllow: /\nSitemap: ${business.origin}/sitemap-index.xml\n`
      : "User-agent: *\nDisallow: /\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
