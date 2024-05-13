import path from 'node:path';
import { defineConfig } from 'vite';
import { flat } from 'remeda';
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
      external: flat([
        ...(packageJson.dependencies ? Object.keys(packageJson.dependencies) : []),
      ].map(dep => [dep, new RegExp(`^${dep}(/.*)?`)])),
      output: {
        inlineDynamicImports: false,
        chunkFileNames: `[format]/[name].js`,
      },
    },
  },
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@adhese/sdk-shared': `${path.resolve()}/../sdk-shared/src`,
      '@server-mocks': `${path.resolve()}/../server-mocks/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
});
