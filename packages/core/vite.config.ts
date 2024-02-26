import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({

  plugins: [react()],
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
      /* eslint-disable ts/naming-convention */
      '@utils': `${path.resolve()}/../utils/src`,
      '@core': `${path.resolve()}/src`,
      '@devtools': `${path.resolve()}/../devtools/src`,
      '@logger': `${path.resolve()}/../logger/src`,
      '@server-mocks': `${path.resolve()}/../server-mocks/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
    },
    setupFiles: './vitest.setup.ts',
  },
});
