---
"@adhese/sdk-devtools": patch
---

Fix issue where the SDK would be disposed before the devtools was done loading. This is especially an issue in React strict mode where the sdk is immediately disposed and recreated creating a duplicate instance of the devtools that would be useless.
