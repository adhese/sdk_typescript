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
argument with data relevant to the hook that can be modified by returning a new value.

### Available Hooks

| Hook         | Argument type      | Description                                                                                                                                        |
|--------------|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `onInit`     | `void`             | Hook is executed when the SDK initialisation is finished. Note that when this hook is added after initialisation the contents are run immediately. |
| `onDispose`  | `void`             | Hook is executed when the SDK is disposed.                                                                                                         |
| `onRender`   | `Ad`               | Hook is run before the ad is rendered. The hook passes an `Ad` object that you can modify.                                                         |
| `onRequest`  | `AdRequestOptions` | Hook is run before a request is made to the server. The hook passes a `AdRequestOptions` object that you can modify.                               |
| `onResponse` | `Ad`               | Hook is run after a response received. The hook passes an `Ad` object that you can modify.                                                         |

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

## Async hook bodies
Hooks can be asynchronous. This can be useful when you need to perform an asynchronous operation, like fetching data
from a server, before the SDK is initialized. To make a hook asynchronous, you can return a `Promise` from the hook body.

```js
function myPlugin(context) {
  onInit(async () => {
    const data = await fetchData();

    console.log(data);
  })
}
```

>[!WARNING]
> When using async hooks you need to be aware that the execution of the hook will be blocked until the promise is
> resolved. This can cause the SDK to be blocked until the promise is resolved. Make sure that the promise resolves
> quickly to prevent blocking the SDK.
