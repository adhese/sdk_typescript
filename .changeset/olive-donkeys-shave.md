---
"@adhese/sdk-shared": patch
"@adhese/sdk": patch
---

Fix slots rendering twice on startup, and duplicate banners stacking up in slots using `renderMode: "inline"`.

Every slot was rendered a second time when the page loaded. The watcher that tracks the device runs once immediately to publish the initial device, and that first run also refreshed and re-rendered every slot — on top of the render each slot already does for itself. It only started to show with 1.12.1: before that, two requests racing for the same slot left one of them waiting on a response it never received, which silently stalled the second render. Sharing the in-flight request let both sides continue. That first run now only publishes the device, and an actual device change still refreshes every slot as before.

`renderInline` appended the creative to the slot's element instead of replacing what was already there, where `renderIframe` has always replaced it. Any second render therefore left the previous creative in place above the new one, whether that was the duplicate startup render or a later refresh or responsive creative swap. It now clears the element before writing, matching `renderIframe`.

This also reverts the "skip rendering when the same ad is already rendered" behaviour from 1.12.2. It could leave a slot permanently blank, while still reporting itself as rendered and counting an impression, for any app that takes ownership of the slot's element — clearing it from an `onBeforeRender` hook, or re-rendering that part of the page with a framework. With the duplicate render gone at its source, the check is no longer needed.
