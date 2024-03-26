import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@utils': `${path.resolve()}/../../packages/utils/src`,
      '@core': `${path.resolve()}/../../packages/core/src`,
      '@logger': `${path.resolve()}/../../packages/logger/src`,
      '@server-mocks': `${path.resolve()}/../../packages/server-mocks/src`,
      '@react-sdk': `${path.resolve()}/../../packages/sdk-react/src`,
      '@adhese/sdk': `${path.resolve()}/../../packages/sdk/src`,
      '@adhese/sdk-devtools': `${path.resolve()}/../../packages/sdk-devtools/src`,
      '@adhese/sdk-react': `${path.resolve()}/../../packages/sdk-react/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
});
