---
"@adhese/sdk": minor
"@adhese/sdk-devtools": patch
---

Add support for identifying an ad's creative as empty (a no-fill/house banner) while still tracking the slot's position, without rendering it.

Call the new `processOnEmpty(ad)` overload from the `onRequest` hook, passing the ad you received, when its content indicates there's nothing real to show. This fires `onEmpty` immediately — as soon as the ad is known to be empty — while keeping the ad's data available so impression and viewability tracking pixels still fire once the slot actually renders; no creative is ever written to the element. `processOnEmpty()` called with no argument keeps its original behaviour: a hard empty (server returned no ad at all), with `status` becoming `empty` and nothing tracked.

Returning a falsy value from the `onBeforeRender` hook now has the same tracked-but-not-rendered effect as a render-time alternative, useful when the decision can only be made right before the creative would be written to the DOM. Either way, the new `isEmpty` flag on the slot context reports whether a `rendered` slot actually got a creative or not.

This also fixes a no-fill creative that was fetched while a slot was out of the viewport still being rendered once the slot scrolled into view: the position-tracked decision is now re-checked at the actual render step (whenever it happens), instead of only at request time.

The devtools slots table now shows a "No-fill" badge for slots that reached `rendered` with `isEmpty` set.

Also fixes a pending viewability tracking pixel outliving a disposed slot: its dwell-time timer is now cancelled on `dispose()` instead of firing later regardless.

When an ad is marked empty, `render()` no longer clears the slot's element. Previously it called `cleanElement()` right before setting `status` to `rendered`, which wiped out any fallback content the app had rendered itself (e.g. from `onEmpty` or `onBeforeRender`) — defeating the purpose of firing `onEmpty` early. The SDK now only skips writing its own creative and leaves the element exactly as the app's hooks left it.
