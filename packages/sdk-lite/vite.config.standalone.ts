import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'lib',
    emptyOutDir: true,
    lib: {
      entry: `src/main.ts`,
      name: 'AdheseLite',
      formats: ['iife'],
      fileName: () => `adheseLite.js`,
    },
  },
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@adhese/sdk-shared': `${path.resolve()}/../sdk-shared/src`,
      '@adhese/sdk': `${path.resolve()}/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
});
