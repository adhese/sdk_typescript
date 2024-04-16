# Getting started

## Installation

### NPM
You can install the SDK into your project using NPM:

::: code-group
```bash [npm]
npm install @adhese/sdk
```
```bash [pnpm]
pnpm add @adhese/sdk
```
```bash [yarn]
yarn add @adhese/sdk
```
```bash [bun]
bun add @adhese/sdk
```
:::

### JS file
You can also include the SDK in your project by including the following script tag in your HTML. <a href="./public/files/adhese.js" download>Download the latest version</a>.

```html
<script src="./files/adhese.js"></script>
```

## Packages

<script setup>
import sdkPackageJson from '../../packages/sdk/package.json';
import sdkReactPackageJson from '../../packages/sdk-react/package.json';
import sdkDevtoolsPackageJson from '../../packages/sdk-devtools/package.json';
import sdkGambitPackageJson from '../../packages/sdk-gambit/package.json';

</script>
- [**@adhese/sdk**](https://npmjs.com/package/@adhese/sdk) - The main SDK package <Badge>v{{sdkPackageJson.version}}</Badge>
- [**@adhese/sdk-react**](https://npmjs.com/package/@adhese/sdk-react) - React utilities for the SDK <Badge>v{{sdkReactPackageJson.version}}</Badge>
- [**@adhese/sdk-devtools**](https://npmjs.com/package/@adhese/sdk-devtools) - Devtools for debugging SDK <Badge>v{{sdkDevtoolsPackageJson.version}}</Badge>
- [**@adhese/sdk-gambit**](https://npmjs.com/package/@adhese/sdk-gambit) - Utilities for converting Gambit config objects to Adhese objects <Badge>v{{sdkGambitPackageJson.version}}</Badge>

## Usage
To use the SDK, you need to create an Adhese instance and configure it with your account ID:

```js
const adhese = createAdhese({
  account: 'your-account-id',
});
```

### Automatically find slots on the page
The SDK can automatically find all slots on the page and load them. This is the easiest way to get started:

```js
const adhese = createAdhese({
  account: 'your-account-id',
  findDomSlotsOnLoad: true,
});
```

Slots are found by looking for elements with the `adunit` class. The element is required to have a
`data-format="YOUR_FORMAT"` attribute set on the element to know which format needs to be fetched.

Example DOM slots:
```html
<div class="adunit" data-format="billboard"></div>

```

### Fetching slots before DOM is ready
If you want to fetch slots before the DOM is ready, you can pass the `initialSlots` option to the `createAdhese`
function. This is particularly useful if you want to start the fetching process as soon as possible. Downside is that
you need to know which slots are going to be on the page on beforehand.

```js
const adhese = createAdhese({
  account: 'your-account-id',
  initialSlots: [
    {
      containingElement: 'slot-1', // ID of the element that contains the slot
      format: 'billboard',
    },
    {
      containingElement: 'slot-2', // ID of the element that contains the slot
      format: 'leaderboard',
    },
  ],
});
```

Example HTML:
```html
<div id="slot-1" class="adunit" data-format="billboard"></div>
<div id="slot-2" class="adunit" data-format="leaderboard"></div>
```

## Options
The `createAdhese` function accepts the following options:

| Option                | Type                                              | Default                                                                                                                                                                               | Description                                                                                                                                                                                                                                                                                |
|-----------------------|---------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `account`<sup>*</sup> | `string`                                          | -                                                                                                                                                                                     | Your Adhese account ID                                                                                                                                                                                                                                                                     |
| `host`                | `string`                                          | <code>'https://ads-<span v-pre>{{account}}</span>.adhese.com'</code>                                                                                                                  | The Adhese API host                                                                                                                                                                                                                                                                        |
| `poolHost`            | `string`                                          | <code>'https://pool-<span v-pre>{{account}}</span>.adhese.com'</code>                                                                                                                 | The Adhese pool host                                                                                                                                                                                                                                                                       |
| `location`            | `string`                                          | `window.location.pathname`                                                                                                                                                            | The page location. This is used to determine the current page location identifier.                                                                                                                                                                                                         |
| `requestType`         | `'GET'` or `'POST'`                               | `'POST'`                                                                                                                                                                              | The requestAds type to use for the Adhese API requests. This can be either `GET` or `POST`. `POST` is the default and offers the most options. `GET` is more limited as it needs pass its data as search parameters but can be used in environments where `POST` requests are not allowed. |
| `debug`               | `boolean`                                         | `false`                                                                                                                                                                               | Enable debug mode                                                                                                                                                                                                                                                                          |
| `findDomSlotsOnLoad`  | `boolean`                                         | `false`                                                                                                                                                                               | Automatically find slots on the page and load them                                                                                                                                                                                                                                         |
| `parameters`          | ``Record<string, string, Array<string>>``         | `{}`                                                                                                                                                                                  | Additional parameters to send with each request. Make sure that the keys of a parameter only contain `2` characters.                                                                                                                                                                       |
| `consent`             | `boolean`                                         | `false`                                                                                                                                                                               | User consent for tracking                                                                                                                                                                                                                                                                  |
| `initialSlots`        | `Array<Slot>`                                     | `[]`                                                                                                                                                                                  | Slots to fetch before the DOM is ready                                                                                                                                                                                                                                                     |
| `logReferrer`         | `boolean`                                         | `true`                                                                                                                                                                                | Will log the `document.referrer` to the Adhese API in a `BASE64` string with the `re` parameter.                                                                                                                                                                                           |
| `logUrl`              | `boolean`                                         | `true`                                                                                                                                                                                | Will log the `location.href` to the Adhese API in a `BASE64` string with the `ur` parameter.                                                                                                                                                                                               |'
| `eagerRendering`      | `boolean`                                         | `false`                                                                                                                                                                               | Will render the ad as soon as it is fetched. In general it is recommended to keep this `false` for better performance.                                                                                                                                                                     |
| `queries`             | `Record<string, string>`                          | `{mobile: '(max-width: 768px) and (pointer: coarse)',tablet: '(min-width: 769px) and (max-width: 1024px) and (pointer: coarse)',desktop: '(min-width: 1025px) and (pointer: fine)',}` | Will be used to determine the device type and screen size. The matching query key will be passed in the `dt` and `br` parameter.                                                                                                                                                           |
| `safeframe`           | `boolean`                                         | `false`                                                                                                                                                                               | Enable Safeframe rendering. See [Safeframe usage](/safeframe) for details                                                                                                                                                                                                                  |
| `plugins`             | `ReadonlyArray<(context: AdheseContext) => void>` | `[]`                                                                                                                                                                                  | The plugins that are used for the Adhese instance. These plugins are called with the Adhese context and run during the initialization of the Adhese instance.                                                                                                                              |

\* Required
