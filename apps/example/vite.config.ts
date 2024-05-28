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
      '@server-mocks': `${path.resolve()}/../../packages/server-mocks/src`,
      '@adhese/sdk': `${path.resolve()}/../../packages/sdk/src`,
      '@adhese/sdk-react': `${path.resolve()}/../../packages/sdk-react/src`,
      '@adhese/sdk-devtools': `${path.resolve()}/../../packages/sdk-devtools/src`,
      '@adhese/sdk-shared': `${path.resolve()}/../../packages/sdk-shared/src`,
      '@adhese/sdk-shared/validators': `${path.resolve()}/../../sdk-shared/src/validators`,
      '@adhese/sdk-stack-slots': `${path.resolve()}/../../packages/sdk-stack-slots/src`,
      '@adhese/sdk-vast-url': `${path.resolve()}/../../packages/sdk-vast-url/src`,
      '@adhese/sdk-user-sync': `${path.resolve()}/../../packages/sdk-user-sync/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
});
