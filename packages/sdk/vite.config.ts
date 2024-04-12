import path from 'node:path';
import { defineConfig } from 'vite';
import flatten from 'lodash/flatten';
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
      fileName: format => `index.${format === 'cjs' ? 'cjs' : 'js'}`,
    },
    sourcemap: true,
    rollupOptions: {
      external: flatten([
        ...(packageJson.dependencies ? Object.keys(packageJson.dependencies) : []),
      ].map(dep => [dep, new RegExp(`^${dep}(/.*)?`)])),
      output: {
        inlineDynamicImports: false,
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
      '@safeframe': `${path.resolve()}/../safeframe/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
});
