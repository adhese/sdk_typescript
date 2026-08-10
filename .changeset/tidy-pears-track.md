---
"@adhese/sdk": patch
"@adhese/sdk-stack-slots": patch
---

Fix tracking pixels being fired more than once, or with an invalid URL.

Impression, additional and viewability tracking state is now tied to the ad that was tracked instead of to the render cycle, so re-rendering a slot for an unchanged ad no longer re-fires its pixels, while a newly requested ad is still tracked.

Stack slots no longer fire a tracking pixel with an `undefined` URL for ads that have no tracking URL.
