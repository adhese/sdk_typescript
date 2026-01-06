import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type UserConfig, type UserConfigFn } from 'vite';

export default (({ mode }): UserConfig => defineConfig({
  build: {
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: mode === 'development'
      ? {
          /* eslint-disable ts/naming-convention */
          '@adhese/sdk': `${path.resolve()}/../../packages/sdk/src/adheseSdk`,
          '@adhese/sdk-react': `${path.resolve()}/../../packages/sdk-react/src/sdkReact`,
          '@adhese/sdk-react/core': `${path.resolve()}/../../packages/sdk-react/src/core`,
          '@adhese/sdk-shared': `${path.resolve()}/../../packages/sdk-shared/src`,
          /* eslint-enable ts/naming-convention */
        }
      : undefined,
  },
})) satisfies UserConfigFn;
