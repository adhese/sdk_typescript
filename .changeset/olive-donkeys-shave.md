---
"@adhese/sdk": patch
---

Fix a slot writing its creative more than once, which stacked duplicate banners for slots using `renderMode: "inline"`.

Several things can ask a slot to render at roughly the same moment, and `render()` wrote the creative again every time it was called. `renderIframe` replaces the element's contents, so this stayed invisible there, but `renderInline` appends: each extra render added another copy of the creative to the slot, re-ran the creative's own scripts and fired the `onRender` hook again.

These repeated renders were being masked until now. Two requests racing for the same slot used to leave one of them waiting on a response it never received, which silently stalled the render that would have followed it. Sharing the in-flight request (1.12.1) let both sides continue, so the second render started happening for real.

A slot now skips writing its creative when that exact ad is already rendered into that exact element. A newly requested ad, an ad passed explicitly to `render()`, or a new element to render into — after an SPA re-mount, for example — all still render as before.
