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

### `Content-Security-Policy`

```txt
default-src 'self'; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none'; object-src 'none'; script-src 'self' https://analytics.ahrefs.com https://plausible.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://analytics.ahrefs.com https://plausible.io https://formspree.io; manifest-src 'self'; media-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests
```

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
- The site still loads Ahrefs Analytics.
- The site loads Plausible (cookieless event analytics, `https://plausible.io/js/script.js`) — see `TS-001` in `docs/tasks/tooltician-strategy-execution-plan.md`. This rule must be applied in Cloudflare manually before events will reach the Plausible panel; the script is otherwise blocked by CSP.
- The site does not need framing by other sites.

## Before re-testing on SecurityHeaders.com

1. Save the Cloudflare response header rule.
2. Purge Cloudflare cache for `tooltician.com`.
3. Confirm the live headers with:

```bash
curl -sSI https://tooltician.com
```

4. Re-test on `https://securityheaders.com/`.
