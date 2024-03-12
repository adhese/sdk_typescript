import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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
      fileName: format => `${format}/index.js`,
    },
    rollupOptions: {
      external: packageJson.dependencies ? Object.keys(packageJson.dependencies) : [],
      output: {
        inlineDynamicImports: false,
        chunkFileNames: `[format]/[name].js`,
      },
    },
  },
});
