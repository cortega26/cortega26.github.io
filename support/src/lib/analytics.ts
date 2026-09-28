import { business, services } from "../config.ts";

// No arbitrary dimensions, raw UTMs, referrers, URLs or user-written fields.
const allowed = {
  location: [
    "header",
    "hero",
    "services",
    "pricing",
    "final",
    "mobile",
    "form",
  ],
  service: [...services.map((s) => s.id), "otro"],
  source: [
    "direct",
    "google",
    "facebook",
    "yapo",
    "referral",
    "tooltician",
    "other",
  ],
  medium: ["none", "organic", "social", "classified", "referral", "qr"],
  campaign: ["launch", "local", "none"],
  content: ["building", "macul", "nunoa", "providencia", "profile", "none"],
};
export const eventNames = [
  "support_page_view",
  "support_whatsapp_click",
  "support_triage_start",
  "support_triage_complete",
  "support_service_view",
  "support_price_view",
  "support_area_view",
  "support_about_view",
  "support_cta_click",
] as const;
export type EventName = (typeof eventNames)[number];
export function safeDimensions(input: Record<string, unknown>) {
  const output: Record<string, string> = {};
  for (const [key, values] of Object.entries(allowed)) {
    const value = input[key];
    if (typeof value === "string" && values.includes(value))
      output[key] = value;
  }
  return output;
}
export function attribution(search: string) {
  const params = new URLSearchParams(search);
  const safe = safeDimensions(
    Object.fromEntries(
      Object.keys(allowed)
        .filter((k) => !["location", "service"].includes(k))
        .map((k) => [k, params.get(`utm_${k}`)]),
    ),
  );
  return {
    source: params.has("utm_source") ? "other" : "direct",
    medium: "none",
    campaign: "none",
    content: "none",
    ...safe,
  };
}

let enabled = false;
let started = false;
let source: Record<string, string> = {};
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};
export function track(name: EventName, data: Record<string, unknown> = {}) {
  if (!enabled || !eventNames.includes(name)) return;
  (window as AnalyticsWindow).gtag?.("event", name, {
    ...safeDimensions({ ...source, ...data }),
    page_location: `${business.origin}${location.pathname}`,
    page_referrer: "",
    send_to: business.analyticsId,
  });
}
export function enableAnalytics() {
  if (!/^G-[A-Z0-9]+$/.test(business.analyticsId)) return;
  enabled = true;
  if (started) return;
  started = true;
  source = attribution(location.search);
  const w = window as AnalyticsWindow;
  const dataLayer: unknown[] = w.dataLayer ?? [];
  w.dataLayer = dataLayer;
  // Canonical gtag shim. A local reference keeps the "queue is initialised"
  // invariant explicit instead of asserting `w.dataLayer` further down, and the
  // rest array is what gets queued, which is what gtag consumers expect.
  w.gtag = (...args: unknown[]) => {
    dataLayer.push(args);
  };
  w.gtag("js", new Date());
  w.gtag("config", business.analyticsId, {
    send_page_view: false,
    page_location: `${business.origin}${location.pathname}`,
    page_referrer: "",
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_domain: location.hostname,
    cookie_expires: 60 * 60 * 24 * 90,
  });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${business.analyticsId}`;
  document.head.append(script);
  track("support_page_view");
}
export function disableAnalytics() {
  enabled = false;
  // Reload after persisting refusal to stop a loaded third-party library entirely.
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.trim().split("=")[0] ?? "";
    if (/^_ga(?:_|$)/.test(name)) {
      document.cookie = `${name}=; Max-Age=0; Path=/`;
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${location.hostname}`;
    }
  }
}
