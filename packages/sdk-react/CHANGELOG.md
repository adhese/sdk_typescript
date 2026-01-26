# @adhese/sdk-react

## 1.9.6

### Patch Changes

- Updated dependencies [932e147]
  - @adhese/sdk-shared@1.5.2
  - @adhese/sdk@1.9.6

## 1.9.5

### Patch Changes

- Updated dependencies [c1dba83]
  - @adhese/sdk@1.9.5

## 1.9.4

### Patch Changes

- Updated dependencies [d30c5f8]
  - @adhese/sdk@1.9.4

## 1.9.3

### Patch Changes

- Updated dependencies [1a40422]
  - @adhese/sdk@1.9.3

## 1.9.2

### Patch Changes

- Updated dependencies [c0c7fe1]
  - @adhese/sdk@1.9.2

## 1.9.1

### Patch Changes

- Updated dependencies [73d76a4]
  - @adhese/sdk@1.9.1

## 1.9.0

### Patch Changes

- Updated dependencies [33ff3bd]
  - @adhese/sdk@1.9.0

## 1.8.3

### Patch Changes

- Updated dependencies [4367dd1]
  - @adhese/sdk-shared@1.5.1
  - @adhese/sdk@1.8.3

## 1.8.2

### Patch Changes

- Updated dependencies [cf3f4ec]
  - @adhese/sdk@1.8.2

## 1.8.1

### Patch Changes

- Updated dependencies [32d5dc9]
  - @adhese/sdk@1.8.1

## 1.8.0

### Patch Changes

- Updated dependencies [de124e0]
  - @adhese/sdk@1.8.0

## 1.7.2

### Patch Changes

- Updated dependencies [3e82746]
  - @adhese/sdk@1.7.2

## 1.7.1

### Patch Changes

- Updated dependencies [59b530a]
  - @adhese/sdk@1.7.1

## 1.7.0

### Patch Changes

- Updated dependencies [737d1e7]
  - @adhese/sdk@1.7.0

## 1.6.5

### Patch Changes

- Updated dependencies [d1e70dd]
  - @adhese/sdk@1.6.5

## 1.6.4

### Patch Changes

- Updated dependencies [d422216]
  - @adhese/sdk@1.6.4

## 1.6.3

### Patch Changes

- Updated dependencies [f7f8a6e]
  - @adhese/sdk-shared@1.5.0
  - @adhese/sdk@1.6.3

## 1.6.2

### Patch Changes

- Updated dependencies [38e8362]
  - @adhese/sdk@1.6.2

## 1.6.1

### Patch Changes

- Updated dependencies [b88acb8]
  - @adhese/sdk@1.6.1

## 1.6.0

### Patch Changes

- Updated dependencies [62cee5f]
  - @adhese/sdk@1.6.0

## 1.5.4

### Patch Changes

- Updated dependencies [19b91db]
- Updated dependencies [19b91db]
  - @adhese/sdk-shared@1.4.2
  - @adhese/sdk@1.5.4

## 1.5.3

### Patch Changes

- Updated dependencies [aad85d5]
  - @adhese/sdk-shared@1.4.1
  - @adhese/sdk@1.5.3

## 1.5.2

### Patch Changes

- 0d36501: Fix SSR useLayoutEffect

## 1.5.1

### Patch Changes

- Updated dependencies [f1a07cf]
- Updated dependencies [f1a07cf]
  - @adhese/sdk@1.5.1
  - @adhese/sdk-shared@1.4.0

## 1.5.0

### Minor Changes

- 86ad92f: Add data-preview to a AdheseSlot when a preview is rendered

### Patch Changes

- Updated dependencies [86ad92f]
  - @adhese/sdk@1.5.0

## 1.4.3

### Patch Changes

- Updated dependencies [6ca2c26]
  - @adhese/sdk@1.4.3

## 1.4.2

### Patch Changes

- Updated dependencies [b178b64]
  - @adhese/sdk@1.4.2

## 1.4.1

### Patch Changes

- 52d0f0c: Optimise React rendering by using `useLayoutEffect` to prevent layout jumping during slot creation
- 52d0f0c: Memoize render output to prevent unneeded triggers
- Updated dependencies [52d0f0c]
- Updated dependencies [52d0f0c]
- Updated dependencies [52d0f0c]
  - @adhese/sdk@1.4.1
  - @adhese/sdk-shared@1.3.1

## 1.4.0

### Minor Changes

- 59e397c: Add useWatch hook that will allow you to observer if a value of reactive object changes within an Adhese slot. The value that is watched is converted into a proper React state that will trigger a re-render when it changes.
- 59e397c: Add reexport to the core @adhese/sdk package

### Patch Changes

- 59e397c: Make sure that the slot state is not updated every time a internal value changes
- Updated dependencies [59e397c]
- Updated dependencies [236883d]
  - @adhese/sdk-shared@1.3.0
  - @adhese/sdk@1.4.0

## 1.3.2

### Patch Changes

- 448224a: Fix custom render not visible in rendering state of the slot
- 4e327ce: Make sure placeholder is rendered as the inital render to fix issues in SSR environments
- 3d76945: Fix license field missing in package.json
- 3d76945: Connect package version more strictly to better enforce tandem updates
- Updated dependencies [448224a]
- Updated dependencies [3d76945]
  - @adhese/sdk@1.3.2

## 1.3.1

### Patch Changes

- 45c5319: Fix rendering being triggered too many times
- Updated dependencies [45c5319]
  - @adhese/sdk@1.3.1

## 1.3.0

### Minor Changes

- 14949a5: Add 'render' prop to render custom React components inside a slot
- 14949a5: Add placeholder prop for rendering content when the loading is not complete yet
- 97e282d: Allow initial slots to be passed in a the React build
- 6cb6dd3: Do not render wrapper element when slot is empty or errored

### Patch Changes

- 65ad4b6: Fix react state not recognizing the changed state of a slot
- Updated dependencies [97e282d]
- Updated dependencies [97e282d]
- Updated dependencies [6cb6dd3]
- Updated dependencies [8f544be]
- Updated dependencies [14949a5]
- Updated dependencies [60f6b8e]
- Updated dependencies [c27d1fa]
  - @adhese/sdk@1.3.0
  - @adhese/sdk-shared@1.2.0

## 1.2.0

### Minor Changes

- ac8433e: Allow passing of all HTMLAttributes props to AdheseSlot to allow more customizing of the rendered element
- ac8433e: Set width and height on passed element from the passed options to prevent content jumping in your page if the size of the slot is already known

### Patch Changes

- ac8433e: Filter out passed undefined values from slot options
- Updated dependencies [ac8433e]
- Updated dependencies [ac8433e]
  - @adhese/sdk@1.1.4

## 1.1.4

### Patch Changes

- f36afb7: Fix @adhese/sdk export for cjs builds not pointing to the correct path
- Updated dependencies [f36afb7]
  - @adhese/sdk@1.1.3

## 1.1.3

### Patch Changes

- f568fa6: Revert chunk splitting in sdk-react as it was causing worse performance timings in applications
- f568fa6: Preload validators on Adhese instance creation

## 1.1.2

### Patch Changes

- 6dd76ff: Make AdheseSlot a lazy component
- 6dd76ff: Wrap watch from @adhese/sdk-shared in dynamic import to enable more chunk splitting
- 6dd76ff: Make passing of options optional to `AdheseProvider`, this will not initialize the SDK but will create the context
  provider. You can, for example, use this to dynamically import plugins first before creating the SDK. See
  `apps/react-example` for an example.

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
  - @adhese/sdk@1.1.0

## 1.0.3

### Patch Changes

- 32e1ca5: Remove src/legacy.d.ts from included files
- 98121c3: Fix slot state sync not working properly
- 5e953f8: Add 'use client' directive to AdheseSlot component for RSC environments

## 1.0.2

### Patch Changes

- e59b2d5: Replace use-deep-compare-effect in useAdheseSlot with useEffect and useRef

## 1.0.1

### Patch Changes

- 5393373: Add fallback legacy d.ts file for older ts version with very limited types
- 5393373: Mode @adhese/sdk as a dependency instead of peer dependency

## 1.0.0

### Major Changes

- ff93b63: 🎉🎉🎉 – Release 1.0.0 – 🎉🎉🎉

  This release marks the first stable release of the Adhese SDK packages. From here on out we will follow semantic
  versioning, meaning that all patch and minor updates will be backwards compatible. Major updates will introduce
  breaking changes.

### Patch Changes

- Updated dependencies [ff93b63]
- Updated dependencies [21aad18]
  - @adhese/sdk@1.0.0
  - @adhese/sdk-shared@1.0.0

## 0.9.14

### Patch Changes

- 1feb9ff: Fix types not being published

## 0.9.13

### Patch Changes

- 10a2c67: Update entry file(s)
- Updated dependencies [10a2c67]
- Updated dependencies [de15eab]
  - @adhese/sdk-shared@0.10.0

## 0.9.12

### Patch Changes

- 2dda12f: Update peerDependencies to match nearest compatible version

## 0.9.11

### Patch Changes

- d8b7f2e: Move remeda exports to @adhese/sdk-shared
- Updated dependencies [aa0ef98]
- Updated dependencies [d8b7f2e]
  - @adhese/sdk-shared@0.9.0

## 0.9.10

### Patch Changes

- Updated dependencies [34268cf]
  - @adhese/sdk-shared@0.8.0

## 0.9.9

### Patch Changes

- Updated dependencies [a4b013d]
- Updated dependencies [696b4ea]
  - @adhese/sdk-shared@0.7.0

## 0.9.8

### Patch Changes

- Updated dependencies [2c01e34]
- Updated dependencies [ad9b38f]
- Updated dependencies [ef68972]
  - @adhese/sdk-shared@0.6.0

## 0.9.7

### Patch Changes

- Updated dependencies [4cb01f8]
  - @adhese/sdk-shared@0.5.0

## 0.9.6

### Patch Changes

- 1819375: Fix Adhese not being properly disposed in React instances

## 0.9.5

### Patch Changes

- Updated dependencies [eca8056]
  - @adhese/sdk-shared@0.4.0

## 0.9.4

### Patch Changes

- Updated dependencies [242cfa3]
  - @adhese/sdk-shared@0.3.0

## 0.9.3

### Patch Changes

- Updated dependencies [44130f4]
  - @adhese/sdk-shared@0.2.0

## 0.9.2

### Patch Changes

- dbc1db3: Fix NPM files not pointing to dist folder

## 0.9.1

### Patch Changes

- eebcd88: Release @adhese/sdk-shared
- Updated dependencies [eebcd88]
  - @adhese/sdk-shared@0.1.0

## 0.9.0

### Minor Changes

- 6294fd5: Add AdheseSlot component

## 0.8.1

### Patch Changes

- 59f07dd: Make packages peer dependant on @adhese/sdk to allow more flexibile dependency installations

## 0.8.0

### Minor Changes

- 10a18fd: Make addSlot function syncronous and remove add function

### Patch Changes

- ee019fd: Update README files to match package specific instructions
- Updated dependencies [ee019fd]
- Updated dependencies [1cc8bff]
- Updated dependencies [76566dc]
- Updated dependencies [10a18fd]
- Updated dependencies [10a18fd]
  - @adhese/sdk@0.8.0

## 0.7.0

### Minor Changes

- 3e0b574: Create plugin system for @adhese/sdk and move @adhese/sdk-devtools to it

### Patch Changes

- fa24130: Replace lodash with remeda to offer a more modern solution to common utilities
- Updated dependencies [c8c37d9]
- Updated dependencies [3e0b574]
- Updated dependencies [80d943b]
- Updated dependencies [fa24130]
  - @adhese/sdk@0.7.0

## 0.6.4

### Patch Changes

- 53683c6: Filter out all external dependencies from bundle
- Updated dependencies [53683c6]
  - @adhese/sdk@0.6.4

## 0.6.3

### Patch Changes

- 99f728f: Replace lodash-es with lodash to prevent breaking CJS builds
- a27f499: Add 'use-client' directive to adheseContext
- 85ee707: Remove dynamicImportInCjs option
- Updated dependencies [99f728f]
- Updated dependencies [85ee707]
  - @adhese/sdk@0.6.3

## 0.6.2

### Patch Changes

- e9fb6f3: Update build outputs to allow installation in CommonJS env
- Updated dependencies [e9fb6f3]
  - @adhese/sdk@0.6.2

## 0.6.1

### Patch Changes

- a5846f2: Move React dependencies to peerDependencies to allow wider React support
- Updated dependencies [c435430]
  - @adhese/sdk@0.6.1

## 0.6.0

### Patch Changes

- 9c80d57: Update dependencies
- Updated dependencies [9c80d57]
- Updated dependencies [41b0dd8]
  - @adhese/sdk@0.6.0

## 0.5.2

### Patch Changes

- f594b82: Fix issue where useAdheseSlot would land in an infinite loop without the options being wrapped in a useMemo
  - @adhese/sdk@0.5.2

## 0.5.1

### Patch Changes

- a211689: Fix issue where the transformed ad was sent again to the onBeforeRender callback making subsequent transforms not possible
- Updated dependencies [a211689]
- Updated dependencies [7fc299d]
  - @adhese/sdk@0.5.1

## 0.5.0

### Minor Changes

- eac9754: Add Vue based reactivity to offer more flexible control flow
- eac9754: Make createAdhese and createSlot syncronous to simplify implementation
- eac9754: Allow having more than one Adhese instance in React applications

### Patch Changes

- Updated dependencies [a666b90]
- Updated dependencies [eac9754]
- Updated dependencies [eac9754]
- Updated dependencies [a666b90]
  - @adhese/sdk@0.5.0

## 0.4.0

### Minor Changes

- 52862a1: Add support for DALE gateway responses

### Patch Changes

- a4da136: Fix GET request not working with some slots properly
- 7bbe1ff: Fix @adhese/sdk-devtools not outputting css to example
- Updated dependencies [52862a1]
- Updated dependencies [a4da136]
  - @adhese/sdk@0.4.0

## 0.3.0

### Patch Changes

- Updated dependencies [22c81ff]
- Updated dependencies [e88cce4]
- Updated dependencies [63cd49f]
  - @adhese/sdk-devtools@0.3.0
  - @adhese/sdk@0.3.0

## 0.2.0

### Minor Changes

- 82d823f: Create separate @adhese/sdk-devtool package to simplify dependencies in the @adhese/sdk package

### Patch Changes

- Updated dependencies [82d823f]
  - @adhese/sdk-devtools@0.2.0
  - @adhese/sdk@0.2.0

## 0.1.5

### Patch Changes

- 6725b17: Add repository field to package.json
- Updated dependencies [6725b17]
  - @adhese/sdk@0.1.5

## 0.1.4

### Patch Changes

- @adhese/sdk@0.1.4

## 0.1.3

### Patch Changes

- @adhese/sdk@0.1.3

## 0.1.2

### Patch Changes

- 6c3b93e: Add license file
- Updated dependencies [6c3b93e]
- Updated dependencies [6c3b93e]
  - @adhese/sdk@0.1.2

## 0.1.1

### Patch Changes

- d481a4e: Add license file
- Updated dependencies [d481a4e]
  - @adhese/sdk@0.1.1

## 0.1.0

### Minor Changes

- 9df9809: Add comitizen
- 9df9809: Initial release

### Patch Changes

- 9df9809: Update dependencies
- 9df9809: Fix eslint-config version number
- Updated dependencies [9df9809]
- Updated dependencies [9df9809]
- Updated dependencies [9df9809]
- Updated dependencies [9df9809]
  - @adhese/sdk@0.1.0
