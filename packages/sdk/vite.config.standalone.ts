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
      entry: `src/main.ts`,
      name: 'Adhese',
      formats: ['iife'],
      fileName: () => `adhese.js`,
    },
  },
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@adhese/sdk-shared/validators': `${path.resolve()}/../sdk-shared/src/validators`,
      '@adhese/sdk-shared': `${path.resolve()}/../sdk-shared/src`,
      '@server-mocks': `${path.resolve()}/../server-mocks/src`,
      '@adhese/sdk': `${path.resolve()}/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
});
