import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig, type UserConfigFn } from 'vite';

export default (({ mode }): UserConfig => defineConfig({
  build: {
    emptyOutDir: true,
  },
  plugins: [react()],
  resolve: {
    alias: mode === 'development'
      ? {
        /* eslint-disable ts/naming-convention */
          '@server-mocks': `${path.resolve()}/../../packages/server-mocks/src`,
          '@adhese/sdk': `${path.resolve()}/../../packages/sdk/src/adheseSdk`,
          '@adhese/sdk-devtools': `${path.resolve()}/../../packages/sdk-devtools/src/sdkDevtools`,
          '@adhese/sdk-react': `${path.resolve()}/../../packages/sdk-react/src/sdkReact`,
          '@adhese/sdk-shared': `${path.resolve()}/../../packages/sdk-shared/src`,
          '@adhese/sdk-shared/validators': `${path.resolve()}/../../sdk-shared/src/validators`,
          '@adhese/sdk-stack-slots': `${path.resolve()}/../../packages/sdk-stack-slots/src/stackSlots`,
        /* eslint-enable ts/naming-convention */
        }
      : undefined,
  },
})) satisfies UserConfigFn;
