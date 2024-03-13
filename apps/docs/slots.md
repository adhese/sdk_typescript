# Slots

Slots are the main building blocks of the Adhese SDK. They are used to fetch and render ads on your page.

## Slots on initialisation
If you know beforehand which slots are going to be on the page, you can pass the `initialSlots` option to the
`createAdhese` function. This is particularly useful if you want to start the fetching process as soon as possible.

```js
const adhese = await createAdhese({
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
const adhese = await createAdhese({
  account: 'your-account-id',
  findDomSlotsOnLoad: true,
})
```
Like the slots on initialisation, slots are identified by looking for elements with the `adunit` class. The element is
required to have a `data-format="YOUR_FORMAT"` attribute set on the element to know which format needs to be fetched.

If after initialisation you want to rescan the DOM you can call the `findDomSlots` method on the Adhese instance.

```js
const adhse = await createAdhese({
  account: 'your-account-id',
})

await adhese.findDomSlots();
```

## Manual slots
It is also possible to manually register slots. You can use the `addSlot` method on the Adhese instance to register a
slot.

```js
const adhese = await createAdhese({
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
const adhese = await createAdhese({
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
const adhese = await createAdhese({
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
