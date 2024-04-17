# Adhese SDK Devtools

The SDK offers a inline application to debug the Adhese instance. The Devtools is available whenever the SDK is in
`debug` mode.

## Installation
The devtools are not included in the SDK by default. To use the Devtools, you need to install the `@adhese/sdk-devtools`

::: code-group
```bash [npm]
npm install @adhese/sdk-devtools
```
```bash [pnpm]
pnpm add @adhese/sdk-devtools
```
```bash [yarn]
yarn add @adhese/sdk-devtools
```
```bash [bun]
bun add @adhese/sdk-devtools
```
:::

Add the `createDevtools` function to your Adhese config plugins field:

```js
import { createDevtools } from '@adhese/sdk-devtools';
import { createAdhese } from '@adhese/sdk';

const adhese = createAdhese({
  account: 'your-account-id',
  plugins: [createDevtools],
});
```

## Usage

Enable `debug` mode by setting the `debug` property to `true` in the `createAdhese` function or by adding
`?adhese_debug=true` to the URL.

Whenever the `debug` mode is enabled, the Devtools is available by clicking the button `Open Adhese Devtools` in the
bottom right corner of the page.

### Inspect slots
The Devtools allows you to inspect the added slots on the page. It shows the following information:
- Slot name
- Format
- Location
- Render status
- Campaign ID
- Booking ID
- Creative ID
- Tracking ID
- Creative type
- Viewability tracked
- Impression tracked
- Element
- Slot parameters - if available

### Logs
The Devtools logs all messages from the SDK. These logs are also available in the browser console.

### Parameters
The parameters tab shows all the global parameters set on the Adhese instance.
