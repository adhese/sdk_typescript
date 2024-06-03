import { defineConfig } from 'vite';
import { flat } from 'remeda';
import { dependencies, peerDependencies } from './package.json';

export default defineConfig({
  build: {
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: 'src/index.ts',
      name: '@adhese/sdk-safe-frame',
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
});
