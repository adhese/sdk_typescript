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
        ...(dependencies ? Object.keys(dependencies) : []),
        ...(peerDependencies ? Object.keys(peerDependencies) : []),
      ].map(dep => [dep, new RegExp(`^${dep}(/.*)?`)])),
      output: {
        inlineDynamicImports: false,
      },
    },
  },
});
