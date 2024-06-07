import path from 'node:path';
import fs from 'node:fs';
import { type Plugin, type UserConfig, type UserConfigFn, defineConfig } from 'vite';

export default (({ mode }): UserConfig => defineConfig({
  build: {
    emptyOutDir: true,
  },
  plugins: [
    ((): Plugin => ({
      name: 'replace-adhese-sdk',
      apply: 'build',
      buildStart(): void {
        fs.copyFileSync(path.resolve(__dirname, '../../packages/sdk-lite/lib/adheseLite.js'), path.resolve(__dirname, 'public/adheseLite.js'));
      },
    }))(),
  ],
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
