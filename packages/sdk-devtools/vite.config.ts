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
      fileName: format => `index.${format === 'cjs' ? 'cjs' : 'js'}`,
    },
    sourcemap: true,
    rollupOptions: {
      external: packageJson.dependencies ? Object.keys(packageJson.dependencies) : [],
      output: {
        inlineDynamicImports: false,
        manualChunks: {
          devtools: ['./src/Devtools.tsx', './src/main.tsx'],
        },
        dynamicImportInCjs: true,
        // chunkFileNames: `[format]/[name].js`,
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
