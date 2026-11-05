---
"@adhese/sdk-shared": minor
"@adhese/sdk-devtools": patch
"@adhese/sdk": patch
"@adhese/sdk-stack-slots": patch
---

Upgrade zod to v4 to resolve GHSA-mrhx-c7xc-m3w5, using `zod/mini` to reduce bundle size. `@adhese/sdk-shared/validators` now re-exports the `zod/mini` API.
