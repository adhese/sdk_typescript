---
title: React SDK
---

<script setup>
import sdkReactPackage from '../../packages/sdk-react/package.json';
</script>

# React SDK <Badge>{{sdkReactPackage.version}}</Badge>

For React developers, we provide a React SDK that allows you to easily integrate our services into your React application.

## Installation
::: code-group
```bash [npm]
npm install @adhese/sdk-react @adhese/sdk
```
```bash [pnpm]
pnpm add @adhese/sdk-react @adhese/sdk
```
```bash [yarn]
yarn add @adhese/sdk-react @adhese/sdk
```
```bash [bun]
bun add @adhese/sdk-react @adhese/sdk
```
:::

## `AdheseProvider`
The `AdheseProvider` component is a context provider that makes the Adhese instance available to all child components.
It should be placed at the root of your application. It accepts an `options` prop that is passed to the `createAdhese`
function. When the `options` prop changes, the Adhese instance is recreated. This provider replaces the `createAdhese`
function.

> [!NOTE]
> The `AdheseProvider` component is a wrapper around the `createAdhese` function. It is required to use the `AdheseProvider` if you want to use the `useAdhese` or `useAdheseSlot` hooks.

```jsx
import { AdheseProvider } from '@adhese/sdk-react';

function App() {
  return (
    <AdheseProvider options={{
      account: 'your-account-id',
      initialSlots: [
        {
          format: 'slot-format' // You can pass in initial slots here that will be pre fetched. When you create your component with same format, slot, and parameters it will use this prefetched data and start rendering immediately.
        }
      ]
    }}
    >
      <YourApp />
    </AdheseProvider>
  );
}
```

## `useAdhese`
The `useAdhese` hook returns the Adhese instance that is created by the `AdheseProvider`. It can be used to access the Adhese instance in any child component.

```jsx
import { useAdhese } from '@adhese/sdk-react';

function YourComponent() {
  const adhese = useAdhese();
  // Use the adhese instance
}
```

## `useAdheseSlot`
The `useAdheseSlot` hook returns a slot object for a given slot name. Use the to create a slot in your component.

It accepts the following arguments:
- `elementRef`: A ref to the element that the slot should be attached to.
- `options`: An object with options for the slot. This object is passed to the `adhese.addSlot` function.

When your component is unmounted, the slot is automatically removed from the Adhese instance.

```jsx
import { useAdheseSlot } from '@adhese/sdk-react';

function YourComponent() {
  const elementRef = useRef(null);

  const slot = useAdheseSlot(elementRef, {
    format: 'your-format',
  });

  return (
    <div ref={elementRef} />
  );
}
```

## `AdheseSlot` component
The `AdheseSlot` component is a wrapper around the `useAdheseSlot` hook. It accepts the same options as the
`useAdheseSlot` hook as props and renders the slot in the DOM.

```jsx
import { AdheseSlot } from '@adhese/sdk-react';

function YourComponent() {
  return (
    <AdheseSlot format="your-format" />
  );
}
```

## Custom slot rendering
Like described in the [slots documentation](/slots.html#hijacking-the-rendering-process), you can use the
`onBeforeRender` callback to intercept the to be rendered ad. Using the `onBeforeRender` hook you can only render
static markup which is not ideal when you are in a React environment. Ideally you'd want to utilize the whole React
feature set. The `AdheseSlot` component offers a prop called `render`, this prop expects a callback that returns JSX.
The slot data is passed as an argument.

```jsx
import { AdheseSlot } from '@adhese/sdk-react';

function YourComponent() {
  return (
    <div>
      <AdheseSlot
        format="flex"
        slot="1"
        render={slot => <DynamicSlot {...slot} />}
      />
      <AdheseSlot
        format="flex"
        slot="2"
        render={slot => <DynamicSlot {...slot} />}
      />
    </div>
  );
}

function DynamicSlot(slot) {
  return (
    <div>
      <h1>{ad.tag.title}</h1>
      <p>{ad.tag.description}</p>
    </div>
  );
}
```

## Placeholders
During loading you render a placeholder.

```jsx
import { AdheseSlot } from '@adhese/sdk-react';

function YourComponent() {
  return (
    <div>
      <AdheseSlot
        format="flex"
        slot="1"
        placeholder={<div>Loading...</div>}
        render={slot => <DynamicSlot {...slot} />}
      />
    </div>
  );
}
```
