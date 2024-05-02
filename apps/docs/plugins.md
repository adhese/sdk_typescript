# Plugins

The SDK provides a plugin system that allows you to extend the SDK's functionality. Plugins can be used to add new
features, modify existing features, or provide additional functionality.

## Creating a Plugin
A plugin is a function that is executed when the SDK is initialized. The function receives the SDK context as an
argument and can be used to modify the SDK's behavior. The body of the function is executed before the whole SDK is
initialized.

## Hooks
To allow plugins to interact with the SDK, the SDK provides a set of hooks that can be used to modify the SDK's behavior.
Hooks are functions that are executed at specific points in the SDK's lifecycle. Depending on the hook, they pass an
argument with data relevant to the hook that can be modified by returning a new value. Hooks are passed as an object to
the plugin function together with miscellaneous data.

```js
function myPlugin(context, plugin) {
  plugin.onInit(() => {
    console.log('SDK initialized');
  });

  plugin.onRender((ad) => {
    console.log('Ad rendered', ad);
  });
```

### Available Hooks

There are three types of hooks: _synchronous_, _asynchronous_, and _passive_. **Synchronous** hooks allow you to modify the passed
argument and return a new value. **Asynchronous** hooks allow you to do the same but also support doing the transformation
asynchronously. **Passive** hooks are read-only and don't support modifying the passed argument. If you don't need to modify
the argument you can always pass a promise or async function to the hook, regardless of the hook type.

| Hook                   | Argument type                             | Type         | Description                                                                                                                                        |
|------------------------|-------------------------------------------|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `onInit`               | `void`                                    | Synchronous  | Hook is executed when the SDK initialisation is finished. Note that when this hook is added after initialisation the contents are run immediately. |
| `onDispose`            | `void`                                    | Synchronous  | Hook is executed when the SDK is disposed.                                                                                                         |
| `onRender`             | `Ad`                                      | Asynchronous | Hook is run before the ad is rendered. The hook passes an `Ad` object that you can modify.                                                         |
| `onRequest`            | `AdRequestOptions`                        | Asynchronous | Hook is run before a request is made to the server. The hook passes a `AdRequestOptions` object that you can modify.                               |
| `onResponse`           | `Ad`                                      | Asynchronous | Hook is run after a response received. The hook passes an `Ad` object that you can modify.                                                         |
| `onSlotCreate`         | `AdheseSlotOptions`                       | Synchronous  | Hook is run before a slot is created. The hook passes an `AdheseSlotOptions` object that you can modify                                            |

## Installing a Plugin
To install a plugin you just need to pass it to the plugins array when initializing the SDK.

```js
import { createAdhese } from '@adhese/sdk';

const adhese = createAdhese({
  account: 'your-account',
  plugins: [myPlugin],
});
```

## Multiple Plugins
You can install multiple plugins by passing them as an array to the plugins option.

```js
import { createAdhese } from '@adhese/sdk';

const adhese = createAdhese({
  account: 'your-account',
  plugins: [plugin1, plugin2, plugin3],
});
```

### Execution Order
The order in which plugins are executed is the same as the order in which they are passed to the plugins array. This is
important when you are doing modifications in for example the `onRender` hook, as the order in which the plugins are
executed can affect the final result. For example, if you have two plugins that modify the same property of the `Ad`
object, the plugin that is executed last will receive the modified value of the previous plugin.

>[!WARNING]
> When using **asynchronous** hooks you need to be aware that the execution of the hook will be blocked until the promise is
> resolved. This can cause the SDK to be blocked until the promise is resolved. Make sure that the promise resolves
> quickly to prevent blocking the SDK.
