---
"@adhese/sdk": minor
"@adhese/sdk-lite": minor
"@adhese/sdk-user-sync": minor
"@adhese/sdk-devtools": patch
---

Move the default Adhese hosts to the new `adhese.eu` domains.

- `host`: `https://ads-<account>.adhese.com` → `https://<account>.ads.adhese.eu`
- `poolHost`: `https://pool-<account>.adhese.com` → `https://<account>.pool.adhese.eu`
- `previewHost`: `https://<account>-preview.adhese.org` → `https://<account>.preview.adhese.eu`

This applies to the SDK, the server-side ad request helpers, SDK Lite and the user sync plugin. The devtools campaign, booking and creative links now point to `https://<account>.classic.adhese.eu`.

Setups that pass `host`, `poolHost` or `previewHost` explicitly are not affected. If your site restricts outgoing requests (for example with a Content-Security-Policy `connect-src` or `frame-src`), add the new `*.adhese.eu` hosts.
