# Safeframe

Safeframe is a technology that allows you to serve ads in a secure and controlled environment. It is a standard
developed by the IAB (Interactive Advertising Bureau) that allows publishers to control the content of the ads that are
displayed on their websites.

## Usage
To use Safeframe, you need to include the Safeframe library in your website. You can do this by adding the Safeframe
script to your HTML file:

```html

<script src="public/files/sf.min.js"></script>
```

> [!IMPORTANT]
> The Safeframe library is not included in the Adhese SDK. You need to include it yourself. You can download the
> Safeframe library <a href="./public/files/sf.min.js" download>here</a>. Make sure to include the library in your HTML with a script tag as the library
> unfortunately does not adhere to stict mode and cannot be imported as a module.

When you have included the library you can enable the `safeframe` option in the `createAdhese` options:

```js{5}
import { createAdhese } from '@adhese/sdk';

const adhese = createAdhese({
  account: 'your-account',
  safeframe: true,
});
```

When you enable the `safeframe` option, the Adhese SDK will automatically create a Safeframe container for each slot
except for slots that have the `renderMode` option set to `inline`.
