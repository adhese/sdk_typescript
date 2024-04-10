import { defineConfig } from 'vitepress';
import packageJson from '../package.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Adhese SDK',
  description: 'SDK for communication with Adhese ads',
  base: '/sdk_typescript/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting started', link: '/getting-started' },
      { text: `v${packageJson.version}`, link: '' },
    ],

    sidebar: [
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Slots', link: '/slots' },
      { text: 'Events', link: '/events' },
      { text: 'Consent', link: '/consent' },
      { text: 'Safeframe', link: '/safeframe' },
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

    lastUpdated: {
      text: 'Last Updated',
      formatOptions: {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
  },
});
