---
"@adhese/sdk": patch
---

Fix a slot that received no ad wiping the contents of its containing element.

When the ad server returned no ad for a slot, the SDK cleared the element's `innerHTML`, removing any content the app had put there itself — such as default content placed in the element hidden and revealed from `onEmpty` when no ad comes back. Since `onEmpty` fires before the element was cleared, that content flashed and then disappeared. A no-fill now only clears the element when it still holds a creative the SDK rendered earlier (e.g. a refresh that comes back empty); otherwise the element is left exactly as the app set it up.
