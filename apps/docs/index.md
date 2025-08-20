# Getting started

> [!TIP]
> Using React? Check out the [React SDK](/react-sdk) documentation.

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

An optional attribute `data-slot="SLOT_CODE"` can be added and allows you to set up extra positions for the same format.

Example DOM slots:
```html
<div class="adunit" data-format="billboard"></div>
<div class="adunit" data-format="billboard" data-slot="_2"></div>
```

### Fetching slots before DOM is ready
If you want to fetch slots before the DOM is ready, you can pass the `initialSlots` option to the `createAdhese`
function. This is particularly useful if you want to start the fetching process as soon as possible. Downside is that
you need to know which slots are going to be on the page beforehand.

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

### Adding target data
To add target data to the ad requests, you can make use of the `parameters` option in the `createAdhese`
function. This config receives an object containing the different (2 letter) target 'prefixes' with their corresponding target values.

> [!WARNING]
> Each prefix has to match a prefix configured on the Adhese adserver. Contact support if you are not sure which prefix to use or if a new target needs to be set up. This is important because some prefixes are reserved and have a specific function.

Some targets will receive maximum one value at a time. That value can be passed along as a **string**. Other targets that can receive more than one value, will have to be passed along as an **array**.

Example:

```js
const adhese = createAdhese({
  account: 'your-account-id',
  parameters: {
    ct:["elektronik","computere_og_gaming"],
    br:"chrome"
  }
});
```

## Options
The `createAdhese` function accepts the following options:

| Option                | Type                                              | Default                                                                                                                                                                              | Description                                                                                                                                                                                                                                                                                |
|-----------------------|---------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `account`<sup>*</sup> | `string`                                          | -                                                                                                                                                                                    | Your Adhese account ID                                                                                                                                                                                                                                                                     |
| `host`                | `string`                                          | <code>'https://ads-<span v-pre>{{account}}</span>.adhese.com'</code>                                                                                                                 | The Adhese API host                                                                                                                                                                                                                                                                        |
| `poolHost`            | `string`                                          | <code>'https://pool-<span v-pre>{{account}}</span>.adhese.com'</code>                                                                                                                | The Adhese pool host
| `previewHost`            | `string`                                          | <code>'https://<span v-pre>{{account}}</span>-preview.adhese.org'</code>                                                                                                                | The Adhese preview host URL
| `location`            | `string`                                          | `window.location.pathname`                                                                                                                                                           | The page location. This is used to determine the current page location identifier.                                                                                                                                                                                                         |
| `requestType`         | `'GET'` or `'POST'`                               | `'POST'`                                                                                                                                                                             | The requestAds type to use for the Adhese API requests. This can be either `GET` or `POST`. `POST` is the default and offers the most options. `GET` is more limited as it needs pass its data as search parameters but can be used in environments where `POST` requests are not allowed. |
| `debug`               | `boolean`                                         | `false`                                                                                                                                                                              | Enable debug mode                                                                                                                                                                                                                                                                          |
| `findDomSlotsOnLoad`  | `boolean`                                         | `false`                                                                                                                                                                              | Automatically find slots on the page and load them                                                                                                                                                                                                                                         |
| `parameters`          | ``Record<string, string, Array<string>>``         | `{}`                                                                                                                                                                                 | Additional parameters to send with each request. Make sure that the keys of a parameter only contain `2` characters.                                                                                                                                                                       |
| `consent`             | `boolean`                                         | `false`                                                                                                                                                                              | User consent for tracking                                                                                                                                                                                                                                                                  |
| `initialSlots`        | `Array<Slot>`                                     | `[]`                                                                                                                                                                                 | Slots to fetch before the DOM is ready                                                                                                                                                                                                                                                     |
| `logReferrer`         | `boolean`                                         | `true`                                                                                                                                                                               | Will log the `document.referrer` to the Adhese API in a `BASE64` string with the `re` parameter.                                                                                                                                                                                           |
| `logUrl`              | `boolean`                                         | `true`                                                                                                                                                                               | Will log the `location.href` to the Adhese API in a `BASE64` string with the `ur` parameter.                                                                                                                                                                                               |'
| `eagerRendering`      | `boolean`                                         | `false`                                                                                                                                                                              | Will render the ad as soon as it is fetched. In general it is recommended to keep this `false` for better performance.                                                                                                                                                                     |
| `refreshOnResize`      | `boolean`                                         | `true`                                                                                                                                                                              | Will disable the refreshing of the ads when resizing your browser and passing to a new device type.
| `queries`             | `Record<string, string>`                          | `{phone: '(max-width: 768px) and (pointer: coarse)',tablet: '(min-width: 769px) and (max-width: 1024px) and (pointer: coarse)',desktop: '(min-width: 1025px) and (pointer: fine)',}` | Will be used to determine the device type and screen size. The matching query key will be passed in the `dt` and `br` parameter.                                                                                                                                                           |
| `plugins`             | `ReadonlyArray<(context: AdheseContext) => void>` | `[]`                                                                                                                                                                                 | The plugins that are used for the Adhese instance. These plugins are called with the Adhese context and run during the initialization of the Adhese instance.                                                                                                                              |

\* Required
