# Cloudflare Security Headers For `tooltician.com`

`tooltician.com` is hosted on GitHub Pages and proxied by Cloudflare.
Because GitHub Pages does not support custom response headers, the `SecurityHeaders.com`
grade must be improved by adding response headers in Cloudflare.

## Recommended Cloudflare setup

Use `Rules` -> `Transform Rules` -> `Modify Response Header`.

Create one rule for host `tooltician.com` and apply these `Set static` headers:

### `Strict-Transport-Security`

```txt
max-age=31536000; includeSubDomains; preload
```

### `Content-Security-Policy` (actual efectivo + Plan 006 GA4)

```txt
default-src 'self'; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'wasm-unsafe-eval' 'sha256-TmHOajS6t5/QY5KaUTImfqGzR2lm8kRkwsvdwdyyJ2k=' 'sha256-Jg+1a9BpA31iySvZGcqQpUpwXgkkS/6nQZErUKX8Es=' 'sha256-AgdfQ26gNc5sf5Njp+l68xeI3QwSHUs5YBMqXmFAwUo=' 'sha256-R+ThK1ExJbsszqXj3FZbVZ15e9+xFQeukNF1TYuHXp8=' 'sha256-4IyZhVv+RWju+1/qJEKCsZqtEjlfkQeg7lwN85qT6Y8=' https://gc.zgo.at https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' blob: https://gc.zgo.at https://formspree.io https://extensions.duckdb.org https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com; manifest-src 'self'; media-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests
```

> `sha256-4IyZhVv+RWju+1/qJEKCsZqtEjlfkQeg7lwN85qT6Y8=` = GA4 inline bootstrap (`window.dataLayer`/`gtag` stub, `ga4Id=G-2HK4GHK7GR`, `cookie_expires: 60*60*24*395`) — `BaseLayout.astro:108-114` (`define:vars={{ga4Id}}`). Generado con `openssl dgst -sha256 -binary | openssl base64` sobre el contenido exacto del `<script>` inline tras `astro build` (ver `plans/006-plausible-to-ga4-migration.md:5`). Bootstrap anterior `sha256-BZJxfeK...` era sin `cookie_expires`; actualizado a `395d` (≈13 meses, 34128000s, API solo soporta segundos, sin precisión calendárica). Sin este hash el stub sería bloqueado (no hay `unsafe-inline` en `script-src`).

### `X-Frame-Options`

```txt
DENY
```

### `X-Content-Type-Options`

```txt
nosniff
```

### `Referrer-Policy`

```txt
strict-origin-when-cross-origin
```

### `Permissions-Policy`

```txt
accelerometer=(), autoplay=(), camera=(), display-capture=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), publickey-credentials-get=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()
```

### `Cross-Origin-Opener-Policy`

```txt
same-origin
```

### `Cross-Origin-Resource-Policy`

```txt
same-origin
```

## Why this policy fits the current site

- The root language selector now uses self-hosted fonts.
- The site still uses Formspree for form submission.
- The site loads GA4 directly via `gtag.js` (`https://www.googletagmanager.com` + `https://www.google-analytics.com`/`region1`, `cookie_expires: 60*60*24*395` = 34128000s ≈395d) — see Plan 006. Inline bootstrap is allowed via `sha256-4IyZhVv+RWju+1/qJEKCsZqtEjlfkQeg7lwN85qT6Y8=`.
- Ahrefs Analytics was removed after its comparison period; its hosts are no longer required by the CSP.
- `chile-hub` (`https://tooltician.com/chile-hub/`) requirements preserved: `https://gc.zgo.at` (GoatCounter), `https://extensions.duckdb.org` (DuckDB-Wasm), `https://fonts.googleapis.com`/`https://fonts.gstatic.com`, `'wasm-unsafe-eval'` + 4 `sha256-` hashes, `blob:` in `connect-src`/`worker-src`.
- Plausible (`https://plausible.io`) removed after GA4 validation — see Plan 006 §10.
- The site does not need framing by other sites.

## Path-scoped CSP for analytics (remediation 2026-09-20)

**Why paths, not the host.** The rule above is host-wide: the same header is served on
`/`, `/en/`, `/es/`, `/chile-hub/`, `/polla/`, `/rutificador/` (verified with `curl -I`).
`pipelines/polla` forbids third-party telemetry (`AGENTS.md`, "Security & Privacy"), and today the
host-wide CSP is the only thing that stops Cloudflare's auto-injected Web Analytics beacon on `/polla/`.
Adding Cloudflare hosts to the base rule would silently enable it there. So the base rule stays
**unchanged** and two narrower rules are layered on top.

Cloudflare applies Modify Response Header rules in order, and the last rule that sets the same
header wins. Create these **after** the base rule (drag them below it):

| Rule | Expression | CSP |
|---|---|---|
| tooltician-site analytics | `(http.host eq "tooltician.com" and (http.request.uri.path eq "/" or starts_with(http.request.uri.path, "/en/") or starts_with(http.request.uri.path, "/es/")))` | base **+** `script-src https://static.cloudflareinsights.com`, `connect-src https://cloudflareinsights.com` |
| chile-hub analytics | `(http.host eq "tooltician.com" and starts_with(http.request.uri.path, "/chile-hub/"))` | same as above **+** `connect-src https://chile-hub.goatcounter.com` |

`/polla/`, `/rutificador/` and every other path keep the base CSP (no Cloudflare beacon hosts, no GoatCounter endpoint).
`/404.html` also keeps the base CSP; its beacon stays blocked, which is harmless.

### `Content-Security-Policy` — tooltician-site rule (`/`, `/en/*`, `/es/*`)

```txt
default-src 'self'; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'wasm-unsafe-eval' 'sha256-TmHOajS6t5/QY5KaUTImfqGzR2lm8kRkwsvdwdyyJ2k=' 'sha256-Jg+1a9BpA31iySvZGcqQpUpwXgkkS/6nQZErUKX8Es=' 'sha256-AgdfQ26gNc5sf5Njp+l68xeI3QwSHUs5YBMqXmFAwUo=' 'sha256-R+ThK1ExJbsszqXj3FZbVZ15e9+xFQeukNF1TYuHXp8=' 'sha256-4IyZhVv+RWju+1/qJEKCsZqtEjlfkQeg7lwN85qT6Y8=' https://gc.zgo.at https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' blob: https://gc.zgo.at https://formspree.io https://extensions.duckdb.org https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://cloudflareinsights.com; manifest-src 'self'; media-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests
```

### `Content-Security-Policy` — chile-hub rule (`/chile-hub/*`)

```txt
default-src 'self'; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'wasm-unsafe-eval' 'sha256-TmHOajS6t5/QY5KaUTImfqGzR2lm8kRkwsvdwdyyJ2k=' 'sha256-Jg+1a9BpA31iySvZGcqQpUpwXgkkS/6nQZErUKX8Es=' 'sha256-AgdfQ26gNc5sf5Njp+l68xeI3QwSHUs5YBMqXmFAwUo=' 'sha256-R+ThK1ExJbsszqXj3FZbVZ15e9+xFQeukNF1TYuHXp8=' 'sha256-4IyZhVv+RWju+1/qJEKCsZqtEjlfkQeg7lwN85qT6Y8=' https://gc.zgo.at https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' blob: https://gc.zgo.at https://formspree.io https://extensions.duckdb.org https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://cloudflareinsights.com https://chile-hub.goatcounter.com; manifest-src 'self'; media-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests
```

Both differ from the base only by the added Cloudflare Insights hosts (and `chile-hub.goatcounter.com` for chile-hub).
The inline GA4 bootstrap hash is unchanged, because the environment guard
(`public/assets/js/analytics-guard.js`) is an external `'self'` script.

### Cloudflare Web Analytics (dashboard)

- Cloudflare **auto-injects** the beacon (no repo loads it), so there is no duplicate. Do not add a manual snippet.
- Web Analytics → the `tooltician.com` site → **Rules / Manage site**: exclude `/polla/*` so the beacon is not injected there at all
  (defense in depth on top of the unchanged CSP).
- After deploying the rules and purging the cache, confirm on `/en/`, `/es/`, `/chile-hub/` that the console shows no
  `cloudflareinsights` CSP violation and that `https://cloudflareinsights.com/cdn-cgi/rum` returns 204; confirm `/polla/` still does not load it.

### Verify the rules override (do not skip)

"Last rule wins" is what Cloudflare documents for `Set static`, but if the rules ever *stack*, the browser sends two
`Content-Security-Policy` headers and enforces their **intersection**: the new hosts stay blocked and it looks like the rule "did nothing".

```bash
# must print 1 (not 2) for every path
for p in / /en/ /es/ /chile-hub/ /polla/; do
  printf '%s -> ' "$p"; curl -sSI "https://tooltician.com$p" | grep -ci '^content-security-policy'
done
curl -sSI https://tooltician.com/chile-hub/ | grep -i '^content-security-policy' | grep -o 'chile-hub.goatcounter.com'   # must match
curl -sSI https://tooltician.com/polla/     | grep -i '^content-security-policy' | grep -c 'cloudflareinsights\|goatcounter'  # must print 0
```

If a path prints 2, the rules are stacking. Fallback: keep one rule per path group and narrow the **base** rule so it excludes the scoped paths:

```txt
(http.host eq "tooltician.com" and not (http.request.uri.path eq "/" or starts_with(http.request.uri.path, "/en/") or starts_with(http.request.uri.path, "/es/") or starts_with(http.request.uri.path, "/chile-hub/")))
```

Note: as of 2026-09-20 the live pages served **no** `beacon.min.js` tag to `curl`; the beacon is added by Cloudflare's edge and was last seen
blocked in a real browser console (`static.cloudflareinsights.com`). If after applying the rules the console still shows a violation, copy
the exact blocked URI/directive from the console: an inline injection would need a different fix than a host allowance.
Also unrelated to analytics: Cloudflare injects an inline `challenge-platform/scripts/jsd` snippet (per-request values, cannot be hashed) that this CSP blocks; it is not part of this change.

### Not addressed here (pre-existing)

The base rule still allows GA4 and GoatCounter hosts on every path, including `/polla/`, although those pages load neither.
Tightening it requires an inventory of which paths belong to which project and a per-path test; do that as a separate change.

## Before re-testing on SecurityHeaders.com

1. Save the Cloudflare response header rule.
2. Purge Cloudflare cache for `tooltician.com`.
3. Confirm the live headers with:

```bash
curl -sSI https://tooltician.com
```

4. Re-test on `https://securityheaders.com/`.
