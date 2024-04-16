import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { flat } from 'remeda';
import packageJson from './package.json';

export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: 'src/index.ts',
      name: '@adhese/sdk-react',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'cjs' ? 'cjs' : 'js'}`,
    },
    sourcemap: true,
    rollupOptions: {
      external: flat([
        ...(packageJson.dependencies ? Object.keys(packageJson.dependencies) : []),
        ...(packageJson.peerDependencies ? Object.keys(packageJson.peerDependencies) : []),
      ].map(dep => [dep, new RegExp(`^${dep}(/.*)?`)])),
      output: {
        inlineDynamicImports: false,
      },
    },
  },
});
