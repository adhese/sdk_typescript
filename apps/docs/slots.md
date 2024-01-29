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
