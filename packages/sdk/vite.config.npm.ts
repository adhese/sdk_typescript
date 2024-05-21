import path from 'node:path';
import { defineConfig } from 'vite';
import { flat } from 'remeda';
import { dependencies } from './package.json';

export default defineConfig({
  plugins: [],
  build: {
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: 'src/index.ts',
      name: '@adhese/sdk',
      formats: ['es', 'cjs'],
      fileName: format => `[name].${format === 'cjs' ? 'cjs' : 'js'}`,
    },
    sourcemap: true,
    rollupOptions: {
      external: flat([
        ...(dependencies ? Object.keys(dependencies) : []),
      ].map(dep => [dep, new RegExp(`^${dep}(/.*)?`)])),
      output: {
        inlineDynamicImports: false,
      },
    },
  },
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@server-mocks': `${path.resolve()}/../server-mocks/src`,
      '@adhese/sdk': `${path.resolve()}/src`,
      '@adhese/sdk-shared': `${path.resolve()}/../sdk-shared/src`,
      '@adhese/sdk-shared/validators': `${path.resolve()}/../sdk-shared/src/validators`,
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
