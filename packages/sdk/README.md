## Installationonononono

### NPM
You can install the SDK into your project using NPM:

```bash
npm install @adhese/sdk
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

| Option                | Type                                              | Default                                                                                                                                                                              | Description                                                                                                                                                                                                                                                                                |
|-----------------------|---------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `account`<sup>*</sup> | `string`                                          | -                                                                                                                                                                                    | Your Adhese account ID                                                                                                                                                                                                                                                                     |
| `host`                | `string`                                          | <code>'https://ads-<span v-pre>{{account}}</span>.adhese.com'</code>                                                                                                                 | The Adhese API host                                                                                                                                                                                                                                                                        |
| `poolHost`            | `string`                                          | <code>'https://pool-<span v-pre>{{account}}</span>.adhese.com'</code>                                                                                                                | The Adhese pool host                                                                                                                                                                                                                                                                       |
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
| `queries`             | `Record<string, string>`                          | `{phone: '(max-width: 768px) and (pointer: coarse)',tablet: '(min-width: 769px) and (max-width: 1024px) and (pointer: coarse)',desktop: '(min-width: 1025px) and (pointer: fine)',}` | Will be used to determine the device type and screen size. The matching query key will be passed in the `dt` and `br` parameter.                                                                                                                                                           |
| `plugins`             | `ReadonlyArray<(context: AdheseContext) => void>` | `[]`                                                                                                                                                                                 | The plugins that are used for the Adhese instance. These plugins are called with the Adhese context and run during the initialization of the Adhese instance.                                                                                                                              |

\* Required
