import { readFile, writeFile } from 'node:fs/promises';
import { defineConfig } from 'vitepress';

export default async (data: {
  command: string;
  mode: string;
// eslint-disable-next-line ts/explicit-function-return-type,ts/explicit-module-boundary-types
}) => {
  if (data.command === 'build') {
    await Promise.all([
      writeFile('public/files/adhese.js', await readFile('../../packages/sdk/lib/adhese.js')),
      writeFile('public/files/adheseLite.js', await readFile('../../packages/sdk-lite/lib/adheseLite.js')),
    ]);
  }

  return defineConfig({
    title: 'Adhese SDK',
    description: 'SDK for communication with Adhese ads',
    base: '/sdk_typescript/',
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      sidebar: [
        { text: 'Getting Started', link: '/index' },
        { text: 'Slots', link: '/slots' },
        { text: 'Events', link: '/events' },
        { text: 'Consent', link: '/consent' },
        { text: 'Lite', link: '/lite' },
        { text: 'React SDK', link: '/react-sdk' },
        { text: 'Server', link: '/server' },
        {
          text: 'Plugins',
          items: [
            { text: 'Plugins', link: '/plugins' },
            { text: 'Safe Frame', link: '/plugins/safe-frame' },
            { text: 'Devtools', link: '/plugins/devtools' },
            { text: 'Stack Slots', link: '/plugins/stack-slots' },
            { text: 'VAST URL', link: '/plugins/vast-url' },
            { text: 'User Sync', link: '/plugins/user-sync' },
          ],
        },
        {
          text: 'Contributing',
          items: [
            {
              text: 'Running locally',
              link: '/contributing/running-locally',
            },
            {
              text: 'Releasing',
              link: '/contributing/releasing',
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
};
