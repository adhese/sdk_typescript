import path from 'node:path';
import { defineConfig } from 'vite';
import packageJson from './package.json';

export default defineConfig({
  plugins: [],
  build: {
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: 'src/index.ts',
      name: '@adhese/sdk',
      formats: ['es', 'cjs'],
      fileName: format => `${format}/index.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: packageJson.dependencies ? Object.keys(packageJson.dependencies) : [],
      output: {
        inlineDynamicImports: false,
        chunkFileNames: `[format]/[name].js`,
      },
    },
  },
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@utils': `${path.resolve()}/../utils/src`,
      '@core': `${path.resolve()}/../core/src`,
      '@logger': `${path.resolve()}/../logger/src`,
      '@server-mocks': `${path.resolve()}/../server-mocks/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
});
