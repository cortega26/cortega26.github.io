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
default-src 'self'; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'wasm-unsafe-eval' 'sha256-TmHOajS6t5/QY5KaUTImfqGzR2lm8kRkwsvdwdyyJ2k=' 'sha256-Jg+1a9BpA31iySvZGcqQpUpwXgkkS/6nQZErUKX8Es=' 'sha256-AgdfQ26gNc5sf5Njp+l68xeI3QwSHUs5YBMqXmFAwUo=' 'sha256-R+ThK1ExJbsszqXj3FZbVZ15e9+xFQeukNF1TYuHXp8=' 'sha256-4IyZhVv+RWju+1/qJEKCsZqtEjlfkQeg7lwN85qT6Y8=' https://gc.zgo.at https://www.googletagmanager.com https://www.google-analytics.com https://analytics.ahrefs.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' blob: https://gc.zgo.at https://formspree.io https://extensions.duckdb.org https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://analytics.ahrefs.com; manifest-src 'self'; media-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests
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
- The site still loads Ahrefs Analytics (pageviews only, retained 30–60d per Plan 006) — `https://analytics.ahrefs.com`.
- The site now loads GA4 directly via `gtag.js` (`https://www.googletagmanager.com` + `https://www.google-analytics.com`/`region1`, `cookie_expires: 60*60*24*395` = 34128000s ≈395d) — see Plan 006. Inline bootstrap is allowed via `sha256-4IyZhVv+RWju+1/qJEKCsZqtEjlfkQeg7lwN85qT6Y8=`.
- `chile-hub` (`https://tooltician.com/chile-hub/`) requirements preserved: `https://gc.zgo.at` (GoatCounter), `https://extensions.duckdb.org` (DuckDB-Wasm), `https://fonts.googleapis.com`/`https://fonts.gstatic.com`, `'wasm-unsafe-eval'` + 4 `sha256-` hashes, `blob:` in `connect-src`/`worker-src`.
- Plausible (`https://plausible.io`) removed after GA4 validation — see Plan 006 §10.
- The site does not need framing by other sites.

## Before re-testing on SecurityHeaders.com

1. Save the Cloudflare response header rule.
2. Purge Cloudflare cache for `tooltician.com`.
3. Confirm the live headers with:

```bash
curl -sSI https://tooltician.com
```

4. Re-test on `https://securityheaders.com/`.
