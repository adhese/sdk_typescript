# Slots

Slots are the main building blocks of the Adhese SDK. They are used to fetch and render ads on your page.

## Options
Slots accept the following options:

| Option                 | Type                                                                                                                                                                                                                         | Default    | Description                                                                                                                                                                                                                              |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `format`<sup>*</sup>   | `string \| ReadonlyArray<{ format: string; query: string; }>`                                                                                                                                                                | -          | The format code of the slot. Used to find the correct element on the page to render the ad in. If the format is a string, it is used as the format code. If the format is an array, the format code is determined by the query detector. |
| `slot`                 | `string`                                                                                                                                                                                                                     | -          | If we have multiple slots with the same format, we can use this to differentiate between them.                                                                                                                                           |
| `containingElement`    | `string \| HTMLElement`                                                                                                                                                                                                      | -          | The element that contains the slot. Used to find the correct element on the page to render the ad in.                                                                                                                                    |
| `parameters`           | `Record<string, ReadonlyArray<string> \| string>`                                                                                                                                                                            | -          | The parameters that are used to render the ad.                                                                                                                                                                                           |
| `renderMode`           | `'iframe' \| 'inline'`                                                                                                                                                                                                       | `'iframe'` | The render mode of the slot. <ul><li>`iframe`: The ad will be rendered in an iframe. </li><li>`inline`: The ad will be rendered in the containing element.    </li></ul>                                                                 |
| `lazyLoading`          | `boolean`                                                                                                                                                                                                                    | `false`    | If the slot should be lazy loaded. This means that the ad will only be requested when the slot is in the viewport. If `true`, the slot will handle the request itself and render the ad.                                                 |
| `lazyLoadingOptions`   | `{ rootMargin?: string; }`                                                                                                                                                                                                   | -          | Options related to lazy loading. Only available when `lazyLoading` is set to true.                                                                                                                                                       |
| `setup`                | `(context: Ref<AdheseSlot \| null>, plugin: {onRender: ReturnType<typeof createAsyncHook<AdheseAd>>[1];onRequest: ReturnType<typeof createAsyncHook<void>>[1];onDispose: ReturnType<typeof createPassiveHook>[1];}) => void` | -          | Special callback that is run when the slot is initialized. It passes the slot context ref object and a special plugin object that contains a set of hooks you can use to hook into different moments of the slots lifecycle.             |

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
To identify the slot, you need to pass the ID of the element that contains the slot.
The `containingElement` represents the ID of the element.

Example HTML:
```html
<div id="slot-1"></div>
<div id="slot-2"></div>
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
- `none`: The ad is not rendered. This is useful if you want to fetch the ad but handle the render output yourself.

## Setup
To have more advanced control over the slot, you can use the `setup` function on a slot. This function is called during
the initialisation of the slot. It passes two
arguments: the slot context ref object and a special hooks object that contains a set of hooks you can use to hook into
different moments of the slots lifecycle.

```js
adhese.addSlot({
  format: 'billboard',
  containingElement: 'slot-1',
  setup(context, { onRender, onRequest, onDispose }) {
    onRender((ad) => {
      console.log('Ad rendered', ad);
    });

    onRequest(() => {
      console.log('Requesting ad');
    });

    onDispose(() => {
      console.log('Slot disposed');
    });
  },
})
```

A use case for the `setup` function is when your `ad.tag` returns a JSON object. You can use the `onBeforeRender` hook
to parse the JSON object and transform it into your custom HTML.

```js
adhese.addSlot({
  format: 'billboard',
  containingElement: 'slot-1',
  setup(context, { onBeforeRender }) {
    onBeforeRender((ad) => {
      if (typeof ad.tag !== 'object') {
        // If the tag is not an object, return the ad as is
        return ad;
      }

      return {
        ...ad,
        tag: '<div>Custom HTML</div>',
      };
    });
  },
})
```

> [!WARNING]
> The `tag` on the `ad` object can be a JSON object or a HTML string. If you want to dynamically render the ad, you need
> to check if the `tag` is a JSON object yourself. To make sure the tag you return in your `onBeforeRender` as the SDK
> can't render JSON objects.
