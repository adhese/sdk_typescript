import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'lib',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 3,

      },
    },
    lib: {
      entry: `src/sdkLite.ts`,
      name: 'AdheseLite',
      formats: ['iife'],
      fileName: () => `adheseLite.js`,
    },
  },
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@adhese/sdk-shared': `${path.resolve()}/../sdk-shared/src`,
      '@adhese/sdk': `${path.resolve()}/../sdk/src`,
      '@adhese/sdk-lite': `${path.resolve()}/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
});
