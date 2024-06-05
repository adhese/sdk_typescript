import path from 'node:path';
import { type UserConfig, type UserConfigFn, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
          '@adhese/sdk': `${path.resolve()}/../../packages/sdk/src`,
          '@adhese/sdk-lite': `${path.resolve()}/../../packages/sdk-lite/src/sdkLite.ts`,
          '@adhese/sdk-shared': `${path.resolve()}/../../packages/sdk-shared/src`,
        /* eslint-enable ts/naming-convention */
        }
      : undefined,
  },
})) satisfies UserConfigFn;
