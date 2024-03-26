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
      '@devtools': `${path.resolve()}/../../packages/devtools/src`,
      '@logger': `${path.resolve()}/../../packages/logger/src`,
      '@server-mocks': `${path.resolve()}/../../packages/server-mocks/src`,
      '@adhese/sdk': `${path.resolve()}/../../packages/sdk/src`,
      '@adhese/sdk-react': `${path.resolve()}/../../packages/sdk-react/src`,
      '@adhese/sdk-devtools': `${path.resolve()}/../../packages/sdk-devtools/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
});
