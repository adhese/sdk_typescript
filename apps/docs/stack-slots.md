<script setup>
import sdkStacksPackage from '../../packages/sdk-stack-slots/package.json';
</script>

# Stack slots <Badge>{{sdkStacksPackage.version}}</Badge>

If you want to use stack slots, you need to install the `@adhese/sdk-stacks-slots` plugin.

## Installation
::: code-group
```bash [npm]
npm install @adhese/sdk-stacks-slots
```
```bash [pnpm]
pnpm add @adhese/sdk-stacks-slots
```
```bash [yarn]
yarn add @adhese/sdk-stacks-slots
```
```bash [bun]
bun add @adhese/sdk-stacks-slots
```
:::

## Usage
To use stack slots, you need to include the `@adhese/sdk-stacks-slots` plugin in your Adhese instance.

### Initialize the stack slots plugin
```js
import {createAdhese} from '@adhese/sdk';
import {stackSlotsPlugin} from '@adhese/sdk-stack-slots';

const adhese = createAdhese({
  account: 'demo',
  plugins: [stackSlotsPlugin]
})
```

### Create a stack slot
To create a stack slot, you need to call the `addSlot` method on the stackSlots instance like you would with a regular slot.
The only difference is that you need to pass an additional a `type: 'stack'` property to the slot options. Because
stacks are returned as an array of ads you need to use the `onBeforeRender` hook in the `setup` method to render the
ads in your provided HTML.

```js
const slot = adhese.plugins.stackSlots.addSlot({
  format: 'stack',
  containingElement: 'stack',
  maxAds: 3,
  setup(_, {onBeforeRender}) {
    onBeforeRender((ad) => {
      if (typeof ad.tag !== 'object') {
        // If the tag is not an object, return the ad as is
        return ad;
      }

      return {
        ...ad,
        tag: `${ad.tag.map((tag) => `<div>${tag}</div>`).join('')}`,
      };
    });
  }
})
```
