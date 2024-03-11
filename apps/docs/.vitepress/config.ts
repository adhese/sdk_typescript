import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Adhese SDK',
  description: 'SDK for communication with Adhese ads',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting started', link: '/getting-started' },
    ],

    sidebar: [
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Slots', link: '/slots' },
      { text: 'Events', link: '/events' },
      { text: 'Consent', link: '/consent' },
      { text: 'Devtools', link: '/devtools' },
      { text: 'React SDK', link: '/react-sdk' },
      {
        text: 'Contributing',
        items: [
          {
            text: 'Running locally',
            link: '/contributing/running-locally',
          },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/adhese/sdk_typescript' },
    ],
  },
});
