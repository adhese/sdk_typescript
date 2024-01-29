import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@utils': `${path.resolve()}/../../packages/utils/src`,
      '@core': `${path.resolve()}/../../packages/core/src`,
      '@logger': `${path.resolve()}/../../packages/logger/src`,
      '@server-mocks': `${path.resolve()}/../../packages/server-mocks/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
});
