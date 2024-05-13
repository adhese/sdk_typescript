<script setup>
import sdkSafeFramePackage from '../../packages/sdk-safe-frame/package.json';
</script>

# Safe Frame <Badge>{{sdkSafeFramePackage.version}}</Badge>

Safeframe is a technology that allows you to serve ads in a secure and controlled environment. It is a standard
developed by the IAB (Interactive Advertising Bureau) that allows publishers to control the content of the ads that are
displayed on their websites.

## Usage
To use SafeFrame, you need to include the SafeFrame library in your website and install the plugin. You can do this by adding the SafeFrame
script to your HTML file:

### Include the SafeFrame library
```html
<script src="public/files/sf.min.js"></script>
```

> [!IMPORTANT]
> The SafeFrame library is not included in the plugin. You need to include it yourself. You can download the
> SafeFrame library <a href="./public/files/sf.min.js" download>here</a>. Make sure to include the library in your HTML
> with a script tag as the library unfortunately does not adhere to strict mode and cannot be imported as a module.

### Install the SafeFrame plugin
::: code-group
```bash [npm]
npm install @adhese/sdk-safe-frame
```
```bash [pnpm]
pnpm add @adhese/sdk-safe-frame
```
```bash [yarn]
yarn add @adhese/sdk-safe-frame
```
```bash [bun]
bun add @adhese/sdk-safe-frame
```
:::

### Initialize the SafeFrame plugin
```javascript
import {createAdhese} from '@adhese/sdk';
import {safeFramePlugin} from '@adhese/sdk-safe-frame';

const adhese = createAdhese({
  account: 'demo',
  plugins: [safeFramePlugin]
})
```
## Rendering ads in SafeFrame
To render an ad in a SafeFrame, you don't need to do anything special. The plugin will automatically render the ad in a
SafeFrame if the `renderMode` is set to `iframe`, which is the default value. If you want to avoid rendering the ad in a
SafeFrame, you can set the `renderMode` to `inline`.
