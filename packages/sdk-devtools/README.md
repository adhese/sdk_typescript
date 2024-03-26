# Adhese SDK

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
