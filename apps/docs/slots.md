# Slots

Slots are the main building blocks of the Adhese SDK. They are used to fetch and render ads on your page.

## Options
Slots accept the following options:

| Option               | Type                                                          | Default    | Description                                                                                                                                                                                                                              |
|----------------------|---------------------------------------------------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `format`<sup>*</sup> | `string \| ReadonlyArray<{ format: string; query: string; }>` | -          | The format code of the slot. Used to find the correct element on the page to render the ad in. If the format is a string, it is used as the format code. If the format is an array, the format code is determined by the query detector. |
| `slot`               | `string`                                                      | -          | If we have multiple slots with the same format, we can use this to differentiate between them.                                                                                                                                           |
| `containingElement`  | `string \| HTMLElement`                                       | -          | The element that contains the slot. Used to find the correct element on the page to render the ad in.                                                                                                                                    |
| `parameters`         | `Record<string, ReadonlyArray<string> \| string>`             | -          | The parameters that are used to render the ad.                                                                                                                                                                                           |
| `renderMode`         | `'iframe' \| 'inline'`                                        | `'iframe'` | The render mode of the slot. <ul><li>`iframe`: The ad will be rendered in an iframe. </li><li>`inline`: The ad will be rendered in the containing element.    </li></ul>                                                                 |
| `onDispose`          | `() => void`                                                  | -          | Callback when the slot is disposed                                                                                                                                                                                                       |
| `onBeforeRender`     | `(ad: Ad) => Ad \| void;`                                     | -          | Callback that is called before the ad is rendered. This can be used to modify the ad before it is rendered. Particularly useful for rendering ads with custom HTML if the ad tag contains a JSON object.                                 |
| `lazyLoading`        | `boolean`                                                     | `false`    | If the slot should be lazy loaded. This means that the ad will only be requested when the slot is in the viewport. If `true`, the slot will handle the request itself and render the ad.                                                 |
| `lazyLoadingOptions` | `{ rootMargin?: string; }`                                    | -          | Options related to lazy loading. Only available when `lazyLoading` is set to true.                                                                                                                                                       |

## Slots on initialisation
If you know beforehand which slots are going to be on the page, you can pass the `initialSlots` option to the
`createAdhese` function. This is particularly useful if you want to start the fetching process as soon as possible.

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
})
```
To identify the slot, you need to pass the ID of the element that contains the slot and the format of the slot.
The `containingElement` represents the ID of the element.

Example HTML:
```html
<div id="slot-1" class="adunit" data-format="billboard"></div>
<div id="slot-2" class="adunit" data-format="leaderboard"></div>
```

## DOM slots
The SDK is also able to automatically find slots on the page and load them. Pass the `findDomSlotsOnLoad` option to the
`createAdhese` function to enable this behaviour.

```js
const adhese = createAdhese({
  account: 'your-account-id',
  findDomSlotsOnLoad: true,
})
```
Like the slots on initialisation, slots are identified by looking for elements with the `adunit` class. The element is
required to have a `data-format="YOUR_FORMAT"` attribute set on the element to know which format needs to be fetched.

If after initialisation you want to rescan the DOM you can call the `findDomSlots` method on the Adhese instance.

```js
const adhse = createAdhese({
  account: 'your-account-id',
})

await adhese.findDomSlots();
```

## Manual slots
It is also possible to manually register slots. You can use the `addSlot` method on the Adhese instance to register a
slot.

```js
const adhese = createAdhese({
  account: 'your-account-id',
})

await adhese.addSlot({
  containingElement: 'slot-1', // ID of the element that contains the slot
  format: 'billboard',
});
```

## Lazy loading
By default, the SDK will start fetching ads for the slots as soon as they are registered. If you want to optimize
requests you can pass the `lazyLoad` option to the `addSlot` method. This will make sure that is not fetched until the
element is in the viewport.

```js
const adhese = createAdhese({
  account: 'your-account-id',
})

await adhese.addSlot({
  containingElement: 'slot-1', // ID of the element that contains the slot
  format: 'billboard',
  lazyLoad: true,
});
```

## Device specific formats
If you want to fetch a different format for a specific device, you can pass an array of formats to the `format` option
of the `addSlot` with a format and a media query.

```js
const adhese = createAdhese({
  account: 'your-account-id',
})

await adhese.addSlot({
  containingElement: 'slot-1', // ID of the element that contains the slot
  format: [
    {
      format: 'leaderboard',
      mediaQuery: '(max-width: 1023px)',
    },
    {
      format: 'billboard',
      mediaQuery: '(min-width: 1024px)',
    },
  ],
});
```

In this example, the `leaderboard` format will be fetched when the viewport is smaller than 1024px and the `billboard`
format will be fetched when the viewport is larger than 1023px.

## Render modes
The SDK supports different render modes. The render mode can be set on the slot by passing the `renderMode` option to the
`addSlot` method.

```js
const adhese = createAdhese({
  account: 'your-account-id',
})

await adhese.addSlot({
  containingElement: 'slot-1', // ID of the element that contains the slot
  format: 'billboard',
  renderMode: 'iframe',
});
```

The following render modes are supported:
- `iframe`: The ad is rendered in an iframe.
- `inline`: The ad is rendered inline in the containing element.
