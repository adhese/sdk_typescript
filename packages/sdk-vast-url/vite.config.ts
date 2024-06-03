import path from 'node:path';
import { defineConfig } from 'vite';
import { flat } from 'remeda';
import { dependencies, name, peerDependencies } from './package.json';

export default defineConfig({
  build: {
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: 'src/index.ts',
      name,
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'cjs' ? 'cjs' : 'js'}`,
    },
    sourcemap: true,
    rollupOptions: {
      external: flat([
        ...Object.keys(dependencies),
        ...Object.keys(peerDependencies),
      ].map(dep => [dep, new RegExp(`^${dep}(/.*)?`)])),
      output: {
        inlineDynamicImports: false,
      },
    },
  },
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@adhese/sdk': `${path.resolve()}/../sdk/src`,
      '@adhese/sdk-shared': `${path.resolve()}/../sdk-shared/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/types/*.ts'],
    },
    setupFiles: './vitest.setup.ts',
  },
});
