# @adhese/sdk-react

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
