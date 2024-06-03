# @adhese/sdk-devtools

## 0.12.1

### Patch Changes

- 1feb9ff: Fix types not being published

## 0.12.0

### Minor Changes

- b2dfc1e: Use React Context to show Adhese state
- b2dfc1e: Allow editing basic slot parameters from the devtools

### Patch Changes

- 10a2c67: Update entry file(s)
- Updated dependencies [10a2c67]
- Updated dependencies [de15eab]
  - @adhese/sdk-shared@0.10.0

## 0.11.6

### Patch Changes

- 2dda12f: Update peerDependencies to match nearest compatible version

## 0.11.5

### Patch Changes

- d8b7f2e: Move remeda exports to @adhese/sdk-shared
- Updated dependencies [aa0ef98]
- Updated dependencies [d8b7f2e]
  - @adhese/sdk-shared@0.9.0

## 0.11.4

### Patch Changes

- Updated dependencies [34268cf]
  - @adhese/sdk-shared@0.8.0

## 0.11.3

### Patch Changes

- 85ce995: Allow plugins to return data that will be accessible for users through the adhese.plugins property

## 0.11.2

### Patch Changes

- Updated dependencies [a4b013d]
- Updated dependencies [696b4ea]
  - @adhese/sdk-shared@0.7.0

## 0.11.1

### Patch Changes

- ef68972: Add hooks to context instead of global variable which could break when adhese was disposed
- Updated dependencies [2c01e34]
- Updated dependencies [ad9b38f]
- Updated dependencies [ef68972]
  - @adhese/sdk-shared@0.6.0

## 0.11.0

### Minor Changes

- 254aeb3: Sort slots in devtools by the order they appear on the page

### Patch Changes

- Updated dependencies [4cb01f8]
  - @adhese/sdk-shared@0.5.0

## 0.10.0

### Minor Changes

- 0f1b268: Rename createDevtools to devtoolsPlugin

### Patch Changes

- 1819375: Fix Adhese not being properly disposed in React instances
- 0f1b268: Use watcher to listen to changes of the debug property instead of an event

## 0.9.1

### Patch Changes

- eca8056: Move all vue-runtime-core exports to @adhese/sdk-shared
- Updated dependencies [eca8056]
  - @adhese/sdk-shared@0.4.0

## 0.9.0

### Minor Changes

- 242cfa3: Make all slots reactive objects to make interaction with them much more streamlined
- 242cfa3: Create an ID that is generated on slot creation to keep track of the slot. This ID will stay the same even if the name of the slots changes.
- 9ebb4fd: Connect slot status field to slot status value

### Patch Changes

- Updated dependencies [242cfa3]
  - @adhese/sdk-shared@0.3.0

## 0.8.0

### Minor Changes

- 4bf3147: Remove 'Go to element' button and move the function to the name label
- 4bf3147: Move order of columns in the slots table

## 0.7.7

### Patch Changes

- a26839b: Refactor the Adhese instance to be reactive object
- Updated dependencies [44130f4]
  - @adhese/sdk-shared@0.2.0

## 0.7.6

### Patch Changes

- dbc1db3: Fix NPM files not pointing to dist folder

## 0.7.5

### Patch Changes

- eebcd88: Release @adhese/sdk-shared
- Updated dependencies [eebcd88]
  - @adhese/sdk-shared@0.1.0

## 0.7.4

### Patch Changes

- ab07f11: Fix devtools not getting CSS automatically

## 0.7.3

### Patch Changes

- 1de2be6: Fix issue where the SDK would be disposed before the devtools was done loading. This is especially an issue in React strict mode where the sdk is immediately disposed and recreated creating a duplicate instance of the devtools that would be useless.
- e60a716: Remove attributes dialog from log table, if more detailed data is needed for debugging users need to use the browsers console instead

## 0.7.2

### Patch Changes

- 59f07dd: Make packages peer dependant on @adhese/sdk to allow more flexibile dependency installations

## 0.7.1

### Patch Changes

- ee019fd: Update README files to match package specific instructions
- 5dd2e3d: Fix slots not showing up when using devtools in a React app
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

- 7041fc2: Enable StrictMode for @adhese/sdk-devtools
- 80d943b: Update dependencies
- fa24130: Replace lodash with remeda to offer a more modern solution to common utilities
- Updated dependencies [c8c37d9]
- Updated dependencies [3e0b574]
- Updated dependencies [80d943b]
- Updated dependencies [fa24130]
  - @adhese/sdk@0.7.0

## 0.6.5

### Patch Changes

- 3c52662: Move react and react-dom to peerDependencies to support older react versions

## 0.6.4

### Patch Changes

- 53683c6: Filter out all external dependencies from bundle

## 0.6.3

### Patch Changes

- 99f728f: Replace lodash-es with lodash to prevent breaking CJS builds
- 85ee707: Remove dynamicImportInCjs option

## 0.6.2

### Patch Changes

- e9fb6f3: Update build outputs to allow installation in CommonJS env

## 0.6.0

### Patch Changes

- 9c80d57: Update dependencies

## 0.5.2

## 0.5.1

## 0.5.0

### Minor Changes

- eac9754: Add Vue based reactivity to offer more flexible control flow
- eac9754: Make createAdhese and createSlot syncronous to simplify implementation

### Patch Changes

- d7f6111: Update dependencies

## 0.4.0

### Minor Changes

- 52862a1: Add label to devtools to show response origin

### Patch Changes

- 7bbe1ff: Fix @adhese/sdk-devtools not outputting css to example

## 0.3.0

### Patch Changes

- 22c81ff: Move all devtools files to @adhese/sdk-devtools package
- e88cce4: Update external dependencies

## 0.2.0

### Minor Changes

- 82d823f: Create separate @adhese/sdk-devtool package to simplify dependencies in the @adhese/sdk package
