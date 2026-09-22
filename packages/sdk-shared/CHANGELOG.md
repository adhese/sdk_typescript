# @adhese/sdk-shared

## 1.5.7

### Patch Changes

- b3069f1: Fix slots rendering twice on startup, and duplicate banners stacking up in slots using `renderMode: "inline"`.
  
  Every slot was rendered a second time when the page loaded. The watcher that tracks the device runs once immediately to publish the initial device, and that first run also refreshed and re-rendered every slot — on top of the render each slot already does for itself. It only started to show with 1.12.1: before that, two requests racing for the same slot left one of them waiting on a response it never received, which silently stalled the second render. Sharing the in-flight request let both sides continue. That first run now only publishes the device, and an actual device change still refreshes every slot as before.
  
  `renderInline` appended the creative to the slot's element instead of replacing what was already there, where `renderIframe` has always replaced it. Any second render therefore left the previous creative in place above the new one, whether that was the duplicate startup render or a later refresh or responsive creative swap. It now clears the element before writing, matching `renderIframe`.
  
  This also reverts the "skip rendering when the same ad is already rendered" behaviour from 1.12.2. It could leave a slot permanently blank, while still reporting itself as rendered and counting an impression, for any app that takes ownership of the slot's element — clearing it from an `onBeforeRender` hook, or re-rendering that part of the page with a framework. With the duplicate render gone at its source, the check is no longer needed.
  
  Fix a slot that received no ad sometimes never firing `onEmpty`.
  
  Whether a no-fill was reported depended on the slot still being on the `loading` status at the moment the response was handled. A slot that had already begun rendering by then — which is easy to hit for slots near the top of the page, since rendering starts as soon as they are in view — silently stayed blank instead. No `onEmpty`, no `empty` status, and nothing telling the app to collapse or fill the gap.
  
  A missing ad is now read from the request itself: if a slot took part in the request and the response carries no ad for it, it is a no-fill. Slots that were not part of the request are untouched, so a response can no longer mark unrelated slots on the page as empty.

## 1.5.6

### Patch Changes

- 233b11d: Making sure the rendering doesn't happen multiple times when you are already rendering in preview

## 1.5.5

### Patch Changes

- 6751edd: JSON ads will now be correctly translated into an Object again on the Slot instance.

## 1.5.4

### Patch Changes

- f307605: Fixed DOMParser validation to support third-party ad tags.

## 1.5.3

### Patch Changes

- 0626b90: Added README to shared library

## 1.5.2

### Patch Changes

- 932e147: Added a alt text and role = presentation to each tracker placed on a website to comply to the EU WAI standards

## 1.5.1

### Patch Changes

- 4367dd1: Added functionality to render Banners properly inline, allowing Javascript and Styles to be rendered and excecuted properly

## 1.5.0

### Minor Changes

- f7f8a6e: We now check if the returned ad is a full HTML page, if it is, we don't add base html tags to the iframe.

## 1.4.2

### Patch Changes

- 19b91db: Allow `numberLike` validator to accept `number` as an input
- 19b91db: Allow `dateLike` to allow `Date` objects as an input

## 1.4.1

### Patch Changes

- aad85d5: Fixed a bug where single quotes in the creative would be replaced by double quotes.

## 1.4.0

### Minor Changes

- f1a07cf: Deprecate very limited UrlString

## 1.3.1

### Patch Changes

- 52d0f0c: Async hooks that do not have an argument should settle promises concurrently

## 1.3.0

### Minor Changes

- 59e397c: Expose extra helpful types from the @vue/runtime-core package

## 1.2.0

### Minor Changes

- 97e282d: Add generateSlotSignature function to generate a unique signature based on the options of a slot and it's location

## 1.1.0

### Minor Changes

- 112e224: Add `width` and `height` option to overwrite slot sizing

  **NOTE**: Only applies when `renderMode` is `iframe` or `undefined`

## 1.0.0

### Major Changes

- ff93b63: 🎉🎉🎉 – Release 1.0.0 – 🎉🎉🎉

  This release marks the first stable release of the Adhese SDK packages. From here on out we will follow semantic
  versioning, meaning that all patch and minor updates will be backwards compatible. Major updates will introduce
  breaking changes.

### Minor Changes

- 21aad18: Move render functions to @adhese/sdk-shared

### Patch Changes

- Updated dependencies [ff93b63]
- Updated dependencies [21aad18]
  - @adhese/sdk@1.0.0

## 0.10.0

### Minor Changes

- de15eab: Update Remeda to 2.0.1

### Patch Changes

- 10a2c67: Update entry file(s)

## 0.9.2

### Patch Changes

- 1654711: Expand peer dependency range of @adhese/sdk to include version 0.17

## 0.9.1

### Patch Changes

- 2dda12f: Update peerDependencies to match nearest compatible version

## 0.9.0

### Minor Changes

- aa0ef98: Move zod exports to @adhese/sdk-shared
- d8b7f2e: Move remeda exports to @adhese/sdk-shared

## 0.8.0

### Minor Changes

- 34268cf: Move generateName function @adhese/sdk-shared

## 0.7.0

### Minor Changes

- a4b013d: Move addTrackingPixel to @adhese/sdk-shared
- 696b4ea: Replace @vue/runtime-core with @vue/reactivity and @vue-reactivity/watch

## 0.6.0

### Minor Changes

- 2c01e34: Replace nanoid with own code
- ef68972: Move hook create functions to @adhese/sdk-shared

### Patch Changes

- ad9b38f: Fix types not being declared for other exports

## 0.5.1

### Patch Changes

- 1164c2b: Move Zod validators to seperate exports

## 0.5.0

### Minor Changes

- 4cb01f8: Reexport extra useful types from @vue/runtime-core

## 0.4.0

### Minor Changes

- eca8056: Move all vue-runtime-core exports to @adhese/sdk-shared

## 0.3.1

### Patch Changes

- 2619416: Fix externals being inclued in output js

## 0.3.0

### Minor Changes

- 242cfa3: Replace uniqueId functionality with the nanoid package

## 0.2.0

### Minor Changes

- 44130f4: Move createLogger to @adhese/sdk-shared

## 0.1.1

### Patch Changes

- dbc1db3: Fix NPM files not pointing to dist folder

## 0.1.0

### Minor Changes

- eebcd88: Release @adhese/sdk-shared
