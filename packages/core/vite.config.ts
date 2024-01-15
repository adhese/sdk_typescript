import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'lib',
    lib: {
      entry: `${path.resolve()}/src/index.ts`,
      name: 'Adhese',
      formats: ['iife'],
      fileName: format => `adhese.${format}.js`,
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
