import type { Theme } from 'vitepress';
// https://vitepress.dev/guide/custom-theme
import { type Component, h } from 'vue';

// eslint-disable-next-line ts/naming-convention
import DefaultTheme from 'vitepress/theme';
import './style.css';

export default {
  extends: DefaultTheme,
  // eslint-disable-next-line ts/naming-convention
  Layout(): Component {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp(): void {
    // ...
  },
} satisfies Theme;
