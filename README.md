# Adhese SDK
[![Release](https://github.com/adhese/sdk_typescript/actions/workflows/release.yaml/badge.svg?branch=main)](https://github.com/adhese/sdk_typescript/actions/workflows/release.yaml)
[![On push](https://github.com/adhese/sdk_typescript/actions/workflows/push.yaml/badge.svg?branch=main)](https://github.com/adhese/sdk_typescript/actions/workflows/push.yaml)
[![License: GPL-3](https://img.shields.io/badge/license-GPLv3-blue)](/LICENSE)
[![@adhese/sdk version](https://img.shields.io/npm/v/%40adhese%2Fsdk?label=%40adhese%2Fsdk)](https://www.npmjs.com/package/@adhese/sdk)
[![@adhese/sdk-react version](https://img.shields.io/npm/v/%40adhese%2Fsdk-react?label=%40adhese%2Fsdk-react)](https://www.npmjs.com/package/@adhese/sdk-react)
[![@adhese/sdk-devtools version](https://img.shields.io/npm/v/%40adhese%2Fsdk-devtools?label=%40adhese%2Fsdk-devtools)](https://www.npmjs.com/package/@adhese/sdk-devtools)
[![@adhese/sdk-gambit version](https://img.shields.io/npm/v/%40adhese%2Fsdk-gambit?label=%40adhese%2Fsdk-gambit)](https://www.npmjs.com/package/@adhese/sdk-gambit)
[![@adhese/sdk-shared version](https://img.shields.io/npm/v/%40adhese%2Fsdk-shared?label=%40adhese%2Fsdk-shared)](https://www.npmjs.com/package/@adhese/sdk-shared)
[![@adhese/sdk-stack-slots version](https://img.shields.io/npm/v/%40adhese%2Fsdk-stack-slots?label=%40adhese%2Fsdk-vast-url)](https://www.npmjs.com/package/@adhese/sdk-stack-slots)
[![@adhese/sdk-vast-url version](https://img.shields.io/npm/v/%40adhese%2Fsdk-vast-url?label=%40adhese%2Fsdk-vast-url)](https://www.npmjs.com/package/@adhese/sdk-vast-url)

## Introduction
This monorepo contains the Adhese SDK for web. The project uses Turborepo to manage the monorepo. Make sure to run
everything from the root of the project.

## Running the project
Install dependencies:
```
npm i
```
> Only use `npm` to install dependencies. `pnpm` and `yarn` will create their own lockfiles and will cause issues when
> maintaining the project.

### Dev mode
Start the dev server:
```bash
npm run dev
```

This will spin up multiple processes at the same time depending on the package or app own configuration. In general,
packages will start the test runner in watch mode and the docs app will start a dev server. For example, the
`apps/example` will start a test server on `localhost:5173`.

### Testing
Run all tests:
```bash
npm run test
```

This will run all tests in packages that have tests configured. It will also report test coverage. Currently, all
projects use [Vitest](https://vitest.dev/) as the test runner.

### Building
Build all packages:
```bash
npm run build
```

This will build all packages and apps.

### Linting
Lint all packages:
```bash
npm run lint
```

This will lint all packages and apps. Currently, all projects use [ESLint](https://eslint.org/) as the linter.

## Installing new dependencies
When installing new dependencies, consider the following:
- Do I need this dependency in all packages?
  - If yes, install it in the root of the project using `npm install <package>`.
  - If no, install it in the package that needs it using `npm install <package> -w <package-name>`.
- Is it a dev dependency?
  - If no, make sure to separately install into the `packages/sdk/package.json` to make sure that the dependency is not
    included in the bundle as NPM will handle the dependency.
