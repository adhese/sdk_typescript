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
      '@adhese/sdk-devtools': `${path.resolve()}/../../packages/sdk-devtools/src`,
      '@adhese/sdk-react': `${path.resolve()}/../../packages/sdk-react/src`,
      '@adhese/sdk-gambit': `${path.resolve()}/../../packages/sdk-gambit/src`,
      '@adhese/sdk-shared': `${path.resolve()}/../../packages/sdk-shared/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
});
