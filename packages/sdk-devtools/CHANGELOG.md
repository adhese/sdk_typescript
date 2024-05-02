# @adhese/sdk-devtools

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
