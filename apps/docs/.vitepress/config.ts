import { type DefaultTheme, type UserConfig, defineConfig } from 'vitepress';
import referencePaths from '../reference/[package].paths';

// https://vitepress.dev/reference/site-config
export default async (): Promise<UserConfig<DefaultTheme.Config>> => {
  const referencePathsResult = await referencePaths.paths();

  return defineConfig({
    title: 'Adhese SDK',
    description: 'SDK for communication with Adhese ads',
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Getting started', link: '/getting-started' },
      ],

      sidebar: [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/getting-started' },
          ],
        },
        {
          text: 'Contributing',
          items: [
            {
              text: 'Running locally',
              link: '/contributing/running-locally',
            },
          ],
        },
        {
          text: 'Reference',
          items: referencePathsResult.toSorted((a, b) => a.params.package.localeCompare(b.params.package)).map(({ params }) => ({
            text: params.package,
            link: `/reference/${params.package}`,
          })),
        },
      ],

      socialLinks: [
        { icon: 'github', link: 'https://github.com/adhese/sdk_typescript' },
      ],
    },
  });
};
