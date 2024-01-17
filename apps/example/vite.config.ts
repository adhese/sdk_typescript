import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      // eslint-disable-next-line ts/naming-convention
      '@utils': `${path.resolve()}/../../packages/utils/src`,
      // eslint-disable-next-line ts/naming-convention
      '@core': `${path.resolve()}/../../packages/core/src`,
    },
  },
});
