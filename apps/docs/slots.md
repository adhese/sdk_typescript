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
| `setup`                | `(context: Ref<AdheseSlotContext \| null>, hooks: AdheseSlotHooks) => void`                                                                                                                                                  | -          | Special callback that is run when the slot is initialized. It passes the slot context ref object and a hooks object you can use to hook into different moments of the slot's lifecycle. See [Setup](#setup) below for the full list of hooks. |

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
      console.log('Ad requested');
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

### Detecting empty/no-fill creatives
Some ad servers return a valid ad response even when there's no real creative to show (e.g. a house banner with a
recognisable marker). To treat such a response as empty, inspect it in `onRequest` and call
`context.value.processOnEmpty(ad)`, passing the ad you received. This fires `onEmpty` immediately — as soon as the
ad is known to be empty, without waiting for the slot to actually render — while keeping the ad's data around so
the slot's position is still tracked (impression/viewability pixels still fire) once it does render. No creative is
ever written to the element.

```js
adhese.addSlot({
  format: 'billboard',
  containingElement: 'slot-1',
  setup(context, { onRequest, onEmpty }) {
    onRequest((ad) => {
      const title = typeof ad.tag === 'string' ? ad.tag.match(/<title>([\s\S]*?)<\/title>/i)?.[1] : undefined;

      if (title === 'Empty') {
        context.value?.processOnEmpty(ad);
      }

      // Always return the ad, even when it was identified as empty: `processOnEmpty(ad)` is what marks it
      // empty, so returning it unchanged keeps its data available for tracking once the slot renders.
      return ad;
    });

    onEmpty(() => {
      console.log('Slot resolved to an empty/no-fill creative');
    });
  },
})
```

> [!NOTE]
> `processOnEmpty()` called with no argument (e.g. when the server returns no ad for the slot at all) is a hard
> empty: the slot's `status` becomes `empty` and nothing is tracked, since there's no ad and no position to track
> yet. Calling it with the ad (`processOnEmpty(ad)`) is what enables the "tracked but not rendered" behaviour above.
>
> If you'd rather do the check right before the creative would be written to the DOM instead (e.g. because the
> decision depends on something only known at render time), return a falsy value from `onBeforeRender` instead —
> it has the same tracked-but-not-rendered effect, just fired later, once the slot actually renders.

### Slot state
Besides options, a slot exposes a few read-only properties reflecting its current lifecycle state:

| Property               | Type                                                                                                          | Description                                                                                                                                                                                    |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `status`                | `'initializing' \| 'initialized' \| 'loading' \| 'loaded' \| 'empty' \| 'rendering' \| 'rendered' \| 'error'` | The slot's current lifecycle state. `'empty'` means the server returned no ad for this slot at all; `'rendered'` means it either shows a creative or, when `isEmpty` is `true`, has its position tracked without one. |
| `isEmpty`               | `boolean`                                                                                                     | Whether the ad was identified as empty (a no-fill/house creative), via `processOnEmpty(ad)` from `onRequest` or a falsy return from `onBeforeRender`. Only meaningful once `status` is `'rendered'`.                    |
| `isViewabilityTracked`  | `boolean`                                                                                                     | Whether the viewability tracking pixel has fired.                                                                                                                                                                       |
| `isImpressionTracked`   | `boolean`                                                                                                     | Whether the impression tracking pixel has fired.                                                                                                                                                                        |
| `data`                  | `AdheseAd \| null`                                                                                            | The ad data fetched from the API for this slot, if any.                                                                                                                                                                 |
| `isVisible`             | `boolean`                                                                                                      | Whether the slot's element is currently in the viewport.                                                                                                                                                                |

### Slot hooks
In a setup function the following hooks are available:

- `onInit` Hook that is called when the slot is initialized.
- `onBeforeRequest` Hook that is called before the slot is requested from the server. Can be used to hijack the request entirely by returning a `AdheseAd` yourself. If you pass an ad yourself the request to the server is ignored and your ad is used.
- `onRequest` Hook that is called when the slot is requested from the server. Call `context.value.processOnEmpty(ad)` here to identify a no-fill/house creative as empty as soon as it's known, while keeping the slot's position tracked once it renders.
- `onEmpty` Hook that is called when the slot is empty, either because the server returned no ad at all (`processOnEmpty()`, nothing tracked), or because an ad was identified as empty via `processOnEmpty(ad)` from `onRequest` or a falsy return from `onBeforeRender` (both keep the slot's position tracked — see `isEmpty` on the slot context).
- `onBeforeRender` Hook that is called right before the slot is rendered. Returning a falsy value marks the ad as empty instead of rendering it, while still tracking the slot's position. A later, render-time alternative to detecting emptiness in `onRequest`.
- `onRender` Hook that is called when the slot is rendered.
- `onImpressionTracked` Hook that is called when the slots impressions is tracked.
- `onViewableTracked` Hook that is called when the slots viewable impressions is tracked.
- `onDispose` Hook that is called when the slot is disposed.
- `onError` Hook that is called when the slot encounters an error.
