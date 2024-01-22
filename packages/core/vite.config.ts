import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'lib',
    emptyOutDir: true,
    lib: {
      entry: `${path.resolve()}/src/index.ts`,
      name: 'Adhese',
      formats: ['iife'],
      fileName: format => `adhese.${format}.js`,
    },
  },
  resolve: {
    alias: {
      // eslint-disable-next-line ts/naming-convention
      '@utils': `${path.resolve()}/../utils/src`,
      // eslint-disable-next-line ts/naming-convention
      '@logger': `${path.resolve()}/../logger/src`,
      // eslint-disable-next-line ts/naming-convention
      '@core': `${path.resolve()}/src`,
    },
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
    },
  },
});
