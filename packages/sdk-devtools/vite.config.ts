import path from 'node:path';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { viteBaseConfig } from '../../vite.baseConfig';
import { dependencies, name, peerDependencies } from './package.json';

export default defineConfig({
  ...viteBaseConfig({
    name,
    dependencies,
    peerDependencies,
    entries: 'src/sdkDevtools.ts',
    plugins: [
      cssInjectedByJsPlugin({
        jsAssetsFilterFunction(chunk) {
          return chunk.name === 'Devtools';
        },
      }),
    ],
  }),
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@adhese/sdk-shared': `${path.resolve()}/../sdk-shared/src`,
      '@server-mocks': `${path.resolve()}/../server-mocks/src`,
      '@adhese/sdk': `${path.resolve()}/../sdk/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
});
