# @adhese/sdk

## 1.9.6

### Patch Changes

- Updated dependencies [932e147]
  - @adhese/sdk-shared@1.5.2

## 1.9.5

### Patch Changes

- c1dba83: Added a check that will render the ad after the element was changed, but only when the ad was already rendered once before.

## 1.9.4

### Patch Changes

- d30c5f8: When new banners are requested on resize, we should render them when the position is in view. That didn't happen unless you scrolled the position back into view. We also added logic that will perform correct tracking when that happens.

## 1.9.3

### Patch Changes

- 1a40422: Fix a bug where the banner renders without checking viewability when you insert a destinvation div after the banners are requested

## 1.9.2

### Patch Changes

- c0c7fe1: Fixed a bug where slot's would trigger as empty after adding an additional slot after the initial load.

## 1.9.1

### Patch Changes

- 73d76a4: Have the Error hook trigger properly.

## 1.9.0

### Minor Changes

- 33ff3bd: Added 2 new slot hooks: onImpressionTracked and onViewableTracked. Triggering when an impression and viewability tracker is being fired off.

## 1.8.3

### Patch Changes

- Updated dependencies [4367dd1]
  - @adhese/sdk-shared@1.5.1

## 1.8.2

### Patch Changes

- cf3f4ec: Make renderMode configurable per slot from within the onBeforeRender hook

## 1.8.1

### Patch Changes

- 32d5dc9: Added functionality that triggers onEmpty hooks even if the destination div of a slot isn't present on the page.

## 1.8.0

### Minor Changes

- de124e0: We added the option to control wheter or not the SDK will refresh the ads when the window is resized and passed the breakpoints for a new device.

## 1.7.2

### Patch Changes

- 3e82746: prevent excessive ad requests

## 1.7.1

### Patch Changes

- 59b530a: Added functionality of passing a previewHost, needed for staging environements. Changed the way previewed ads are matched to known slots, Using the known slot information instead of returned ads information.

## 1.7.0

### Minor Changes

- 737d1e7: Added an additional tracker on AdheseAd that will be fired together with the impressions tracker.

## 1.6.5

### Patch Changes

- d1e70dd: When a DALE responses is returned we will now also meassure viewability properly by fetching the viewability tracker from the right place inside the adresponse

## 1.6.4

### Patch Changes

- d422216: fix module declaration

## 1.6.3

### Patch Changes

- Updated dependencies [f7f8a6e]
  - @adhese/sdk-shared@1.5.0

## 1.6.2

### Patch Changes

- 38e8362: Fixed a bug where tracking was not sent if the content was loading for more than 5 seconds

## 1.6.1

### Patch Changes

- b88acb8: Made the adformat optional to fix issues with DALE ads.

## 1.6.0

### Minor Changes

- 62cee5f: Making all parameters have lower case by default

## 1.5.4

### Patch Changes

- Updated dependencies [19b91db]
- Updated dependencies [19b91db]
  - @adhese/sdk-shared@1.4.2

## 1.5.3

### Patch Changes

- Updated dependencies [aad85d5]
  - @adhese/sdk-shared@1.4.1

## 1.5.1

### Patch Changes

- f1a07cf: Allow general strings instead of the very limited UrlString in host
- Updated dependencies [f1a07cf]
  - @adhese/sdk-shared@1.4.0

## 1.5.0

### Patch Changes

- 86ad92f: Make sure previews are properly matched to a format instead of a creativeId

## 1.4.3

### Patch Changes

- 6ca2c26: Fix default `viewabilityTrackingOptions.threshold` to be `0.5` instead of `0.2`

## 1.4.2

### Patch Changes

- b178b64: Fix eager rendering not doing anything

## 1.4.1

### Patch Changes

- 52d0f0c: Make sure slots cannot trigger a render when the status is `empty` or `error`
- 52d0f0c: Make sure that the onRequest hook is fired when the data is already present as initial data
- Updated dependencies [52d0f0c]
  - @adhese/sdk-shared@1.3.1

## 1.4.0

### Patch Changes

- 236883d: Make sure that the clean element function does not work when renderMode is none
- Updated dependencies [59e397c]
  - @adhese/sdk-shared@1.3.0

## 1.3.2

### Patch Changes

- 448224a: Fix rerender triggering too many times
- 3d76945: Connect package version more strictly to better enforce tandem updates

## 1.3.1

### Patch Changes

- 45c5319: Fix rendering being triggered too many times

## 1.3.0

### Minor Changes

- 97e282d: Allow initial slots without a matching element to make it possible for ads to be preloaded before their creation
- 6cb6dd3: Make sure slot checks for the existence of the element before rendering starts
- 8f544be: Add `onEmpty` hook for slots
- 14949a5: When renderMode is 'none' skip certain steps in the render pipeline as they are not required
- 60f6b8e: Add `onError` hook to slots

### Patch Changes

- c27d1fa: Fix errors being thrown when they are not caught by watchers
- Updated dependencies [97e282d]
  - @adhese/sdk-shared@1.2.0

## 1.2.0

### Minor Changes

- ae79c69: Allow users to only pass an element ID to the containingElement option when defining a slot.

  #### Before

  ```javascript
  const slot = adhese.defineSlot({
    containingElement: "my-element-id",
    format: "leaderboard",
  });
  ```

  Elements would require a class of `adunit` and a matching data attribute of `data-format` to be recognized as an Adhese
  slot.

  ```html
  <div id="my-element-id" class="adunit" data-format="leaderboard"></div>
  ```

  #### After

  ```javascript
  const slot = adhese.defineSlot({
    containingElement: "my-element-id",
    format: "leaderboard",
  });
  ```

  Elements now only require a matching ID to be recognized as an Adhese slot.

  ```html
  <div id="my-element-id"></div>
  ```

## 1.1.4

### Patch Changes

- ac8433e: Move setting of position relative when in debug mode to @adhese/sdk-devtools plugin
- ac8433e: Filter out passed undefined values from slot options

## 1.1.3

### Patch Changes

- f36afb7: Fix @adhese/sdk export for cjs builds not pointing to the correct path

## 1.1.2

### Patch Changes

- f568fa6: Preload validators on Adhese instance creation

## 1.1.1

### Patch Changes

- 180e82a: Fix issue where `mobile` would be passed as a param instead of the required `phone`, which would result in that the server would not return any ads

## 1.1.0

### Minor Changes

- 112e224: Add `width` and `height` option to overwrite slot sizing

  **NOTE**: Only applies when `renderMode` is `iframe` or `undefined`

### Patch Changes

- Updated dependencies [112e224]
  - @adhese/sdk-shared@1.1.0

## 1.0.4

### Patch Changes

- 32e1ca5: Update entry file name to make inspection after bundling easier

## 1.0.3

### Patch Changes

- 43a682c: Revert accidental change of Promise.allSettled to Promise.all which can cause issuess when a request fails
- 5393373: Add fallback legacy d.ts file for older ts version with very limited types

## 1.0.2

### Patch Changes

- ce4a2c0: Fix fetching of initialSlots and dom slots on init not being handled properly causing issues with debug mode not being recognized when set in the URL or when in preview mode

## 1.0.1

### Patch Changes

- d4cedb4: Fix ad data getting set when the data is passed via the render function

## 1.0.0

### Major Changes

- ff93b63: 🎉🎉🎉 – Release 1.0.0 – 🎉🎉🎉

  This release marks the first stable release of the Adhese SDK packages. From here on out we will follow semantic
  versioning, meaning that all patch and minor updates will be backwards compatible. Major updates will introduce
  breaking changes.

### Patch Changes

- 21aad18: Move render functions to @adhese/sdk-shared
- Updated dependencies [ff93b63]
- Updated dependencies [21aad18]
  - @adhese/sdk-shared@1.0.0

## 0.22.0

### Minor Changes

- 3ba6fd6: Add isVissible property to slots

## 0.21.1

### Patch Changes

- 1feb9ff: Fix types not being published

## 0.21.0

### Minor Changes

- b2dfc1e: Make onRender hook a passive hook, hijacks should go via the onBeforeRender hook from now on
- b2dfc1e: Add onInit to slots initialisation

### Patch Changes

- 10a2c67: Update entry file(s)
- Updated dependencies [10a2c67]
- Updated dependencies [de15eab]
  - @adhese/sdk-shared@0.10.0

## 0.20.1

### Patch Changes

- b4a1289: Make ID in response optional

## 0.20.0

### Minor Changes

- d3cb52d: Add consentString property to the Adhese instance that will show the consent string that is generated by either the binary or TCF API

## 0.19.2

### Patch Changes

- aa0ef98: Move zod exports to @adhese/sdk-shared
- d8b7f2e: Move remeda exports to @adhese/sdk-shared
- Updated dependencies [aa0ef98]
- Updated dependencies [d8b7f2e]
  - @adhese/sdk-shared@0.9.0

## 0.19.1

### Patch Changes

- 34268cf: Move generateName function @adhese/sdk-shared
- Updated dependencies [34268cf]
  - @adhese/sdk-shared@0.8.0

## 0.19.0

### Minor Changes

- 85ce995: Allow plugins to return data that will be accessible for users through the adhese.plugins property

## 0.18.0

### Minor Changes

- d52b465: Allow modifying slot data from within a slot's setup function

### Patch Changes

- Updated dependencies [a4b013d]
- Updated dependencies [696b4ea]
  - @adhese/sdk-shared@0.7.0

## 0.17.0

### Minor Changes

- ef68972: Add hooks to context instead of global variable which could break when adhese was disposed
- ef68972: Move hook create functions to @adhese/sdk-shared

### Patch Changes

- Updated dependencies [2c01e34]
- Updated dependencies [ad9b38f]
- Updated dependencies [ef68972]
  - @adhese/sdk-shared@0.6.0

## 0.16.2

### Patch Changes

- 2763181: Force @adhese/sdk to use @adhese/sdk-shared@0.5.1

## 0.16.1

### Patch Changes

- 1164c2b: Move Zod validators to seperate exports

## 0.16.0

### Minor Changes

- 4cb01f8: Move all slot callbacks to the setup function
- 4cb01f8: Expose cleanElement function to slot
- dfe44af: Add device field to Adhese instance that shows the current active device that is selected in by the query detector
- 4cb01f8: Add onBeforeRequest hook to slots
- 4cb01f8: Rename ad property to data to allow more generic data in slots

### Patch Changes

- Updated dependencies [4cb01f8]
  - @adhese/sdk-shared@0.5.0

## 0.15.0

### Minor Changes

- 467d857: Move SafeFrame code to a seperate plugin instead of including it

## 0.14.1

### Patch Changes

- eca8056: Move all vue-runtime-core exports to @adhese/sdk-shared
- Updated dependencies [eca8056]
  - @adhese/sdk-shared@0.4.0

## 0.14.0

### Minor Changes

- 242cfa3: Make all slots reactive objects to make interaction with them much more streamlined
- 242cfa3: Create an ID that is generated on slot creation to keep track of the slot. This ID will stay the same even if the name of the slots changes.
- 9ebb4fd: Add status value to slots

### Patch Changes

- b38e189: Make schema export load dynamically when it's needed
- Updated dependencies [242cfa3]
  - @adhese/sdk-shared@0.3.0

## 0.13.0

### Minor Changes

- 66c3715: Add onEmpty callback to slots that is called whenever a slots remains empty after being requested from the API

### Patch Changes

- 7710851: Make sure non-lazy slots are requested when created
- 31723ae: Fix when requesting slots on creation that the ad value is not set

## 0.12.0

### Minor Changes

- f66cd71: Remove onViewabilityChanged hook and move the implementation to a callback on the createSlot instead
- a26839b: Refactor the Adhese instance to be reactive object

### Patch Changes

- 44130f4: Move createLogger to @adhese/sdk-shared
- Updated dependencies [44130f4]
  - @adhese/sdk-shared@0.2.0

## 0.11.2

### Patch Changes

- dbc1db3: Fix NPM files not pointing to dist folder

## 0.11.1

### Patch Changes

- eebcd88: Release @adhese/sdk-shared
- Updated dependencies [eebcd88]
  - @adhese/sdk-shared@0.1.0

## 0.11.0

### Minor Changes

- 1de2be6: Add isDisposed value to the AdheseContext
- dd01918: Change how requests are handled internally. Requests for slots from the API are now batched to limit the ammount of API calls

### Patch Changes

- b0a0c25: Throw an error when a slot with a duplicate name is added

## 0.10.0

### Minor Changes

- 5e8ecb2: Create onViewabilityChanged hook that is run when a slots visibility changes

## 0.9.0

### Minor Changes

- 484bc66: Create onSlotCreate hook that is run when a new slot is created. It can be used to modify the passed slot options

### Patch Changes

- 12fe2a0: Fix ad not being asigned to the slot.ad value after lazy loading

## 0.8.1

### Patch Changes

- ed346cb: Remove hooks from general export and add pass them as an argument when calling a plugin so they are properly scoped to the Adhese instance
- e8578f2: Add information about the current version in the package.json to plugins
- bef61c2: Remove logs from onInit and onDispose

## 0.8.0

### Minor Changes

- 1cc8bff: Create hooks to write plugins
- 10a18fd: Simplify exposed functions from sdk
- 10a18fd: Make addSlot function syncronous and remove add function

### Patch Changes

- ee019fd: Update README files to match package specific instructions
- 76566dc: Add jsdoc to AdheseOptions.safeframe

## 0.7.0

### Minor Changes

- 3e0b574: Create plugin system for @adhese/sdk and move @adhese/sdk-devtools to it

### Patch Changes

- c8c37d9: Replace special characters in parameters values with underscores
- 80d943b: Update dependencies
- fa24130: Replace lodash with remeda to offer a more modern solution to common utilities

## 0.6.4

### Patch Changes

- 53683c6: Filter out all external dependencies from bundle
- Updated dependencies [53683c6]
  - @adhese/sdk-devtools@0.6.4

## 0.6.3

### Patch Changes

- 99f728f: Replace lodash-es with lodash to prevent breaking CJS builds
- 85ee707: Remove dynamicImportInCjs option
- Updated dependencies [99f728f]
- Updated dependencies [85ee707]
  - @adhese/sdk-devtools@0.6.3

## 0.6.2

### Patch Changes

- e9fb6f3: Update build outputs to allow installation in CommonJS env
- Updated dependencies [e9fb6f3]
  - @adhese/sdk-devtools@0.6.2

## 0.6.1

### Patch Changes

- c435430: Remove unused safeframe package

## 0.6.0

### Minor Changes

- 41b0dd8: Add support for IAB Safeframe

### Patch Changes

- 9c80d57: Update dependencies
- Updated dependencies [9c80d57]
  - @adhese/sdk-devtools@0.6.0

## 0.5.2

### Patch Changes

- @adhese/sdk-devtools@0.5.2

## 0.5.1

### Patch Changes

- a211689: Fix issue where the transformed ad was sent again to the onBeforeRender callback making subsequent transforms not possible
- 7fc299d: Fix issue where onInit was executed multiple times
  - @adhese/sdk-devtools@0.5.1

## 0.5.0

### Minor Changes

- a666b90: Add onBeforeRender callback to intercept the to be rendered ad
- eac9754: Add Vue based reactivity to offer more flexible control flow
- eac9754: Make createAdhese and createSlot syncronous to simplify implementation
- a666b90: Add ability to receive JSON strings in the response tag/body

### Patch Changes

- Updated dependencies [d7f6111]
- Updated dependencies [eac9754]
- Updated dependencies [eac9754]
  - @adhese/sdk-devtools@0.5.0

## 0.4.0

### Minor Changes

- 52862a1: Add support for DALE gateway responses

### Patch Changes

- a4da136: Fix GET request not working with some slots properly
- Updated dependencies [52862a1]
- Updated dependencies [7bbe1ff]
  - @adhese/sdk-devtools@0.4.0

## 0.3.0

### Patch Changes

- 63cd49f: Add missing documentation for debugChange event
- Updated dependencies [22c81ff]
- Updated dependencies [e88cce4]
  - @adhese/sdk-devtools@0.3.0

## 0.2.0

### Minor Changes

- 82d823f: Create separate @adhese/sdk-devtool package to simplify dependencies in the @adhese/sdk package

### Patch Changes

- Updated dependencies [82d823f]
  - @adhese/sdk-devtools@0.2.0

## 0.1.5

### Patch Changes

- 6725b17: Add repository field to package.json

## 0.1.4

## 0.1.3

## 0.1.2

### Patch Changes

- 6c3b93e: Add license file
- 6c3b93e: Add license field to package.json files

## 0.1.1

### Patch Changes

- d481a4e: Add license file

## 0.1.0

### Minor Changes

- 9df9809: Add comitizen
- 9df9809: Initial release

### Patch Changes

- 9df9809: Update dependencies
- 9df9809: Fix eslint-config version number
