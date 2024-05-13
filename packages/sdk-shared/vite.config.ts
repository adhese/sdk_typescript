import { defineConfig } from 'vite';
import { flat } from 'remeda';
import { dependencies } from './package.json';

export default defineConfig({
  build: {
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: 'src/index.ts',
      name: '@adhese/sdk-shared',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'cjs' ? 'cjs' : 'js'}`,
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
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/types/*.ts'],
    },
  },
});
