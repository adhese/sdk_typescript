# Events

The SDK emits events that you can listen to. This can be useful to track the status of the SDK or to know when a slot is loaded.

## Usage
### Adding an event listener
You can add an event listener by accessing the `events` property on the Adhese instance and calling the desired event name as a property and call the `addEventListener` method on it.

```js
function listener(location) {
  console.log('Location changed to', location);
}

adhese.events.locationChange.addEventListener(listener);
```

### Removing an event listener
You can remove an event listener by accessing the `events` property on the Adhese instance and calling the desired event name as a property and call the `removeEventListener` method on it.

```js
adhese.events.locationChange.removeEventListener(listener);
```

> [!NOTE]
> It is important to remove event listeners when they are no longer needed to prevent memory leaks.

> [!WARNING]
> Do not pass an anonymous function to the `addEventListener` method. This will make it impossible to remove the event listener later on.
> It is recommended to use a named function instead.
>
> See the [MDN article](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#memory_issues) for more information.

## Available events

| Event name         | Description                                                                                                                       | Payload                                         |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| `locationChange`   | When the page location changes.                                                                                                   | `string`                                        |
| `consentChange`    | When the consent settings change                                                                                                  | `boolean`                                       |
| `addSlot`          | When a slot is added to the page                                                                                                  | `Slot`                                          |
| `removeSlot`       | When a slot is removed from the page                                                                                              | `Slot`                                          |
| `changeSlots`      | When a slot is changed in general, for example, when a new slot is added or removed or when it's rendered or loading is complete. | `ReadonlyArray<Slot>`                           |
| `responseReceived` | When the request sent to the Adhese API returns with ads                                                                          | `ReadonlyArray<Ad>`                             |
| `requestAd`        | When the request is sent out to the API                                                                                           | `AdRequestOptions`                              |
| `requestError`     | When somewhere in the request pipeline an error pops up                                                                           | `Error`                                         |
| `previewReceived`  | When there is a preview detected in the in browser URL and it has a matching ad in the requested response.                        | `ReadonlyArray<Ad>`                             |
| `parametersChange` | When the global parameters are changed                                                                                            | `Map<string, ReadonlyArray<string>  \| string>` |
| `debugChange`      | When the the debug mode is changed                                                                                                | `boolean`                                       |
