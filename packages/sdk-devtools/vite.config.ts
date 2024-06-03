import path from 'node:path';
import { defineConfig } from 'vite';
import { flat } from 'remeda';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import packageJson from './package.json';

export default defineConfig({
  plugins: [
    cssInjectedByJsPlugin({
      jsAssetsFilterFunction(chunk) {
        return chunk.name === 'main';
      },
    }),
  ],
  build: {
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: 'src/index.ts',
      name: '@adhese/sdk',
      formats: ['es', 'cjs'],
      fileName: format => `[name].${format === 'cjs' ? 'cjs' : 'js'}`,
    },
    sourcemap: true,
    rollupOptions: {
      external: flat([
        ...(packageJson.dependencies ? Object.keys(packageJson.dependencies) : []),
        ...(packageJson.peerDependencies ? Object.keys(packageJson.peerDependencies) : []),
      ].map(dep => [dep, new RegExp(`^${dep}(/.*)?`)])),
      output: {
        inlineDynamicImports: false,
      },
    },
  },
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
