---
"@adhese/sdk": patch
---

When new banners are requested on resize, we should render them when the position is in view. That didn't happen unless you scrolled the position back into view. We also added logic that will perform correct tracking when that happens.
