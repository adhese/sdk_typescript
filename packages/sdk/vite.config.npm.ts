import path from 'node:path';
import { defineConfig } from 'vite';
import { viteBaseConfig } from '../../vite.baseConfig';
import { dependencies, name } from './package.json';

export default defineConfig({
  ...viteBaseConfig({
    dependencies,
    name,
    entries: ['src/adheseSdk.ts', 'src/server.ts'],
  }),
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@server-mocks': `${path.resolve()}/../server-mocks/src`,
      '@adhese/sdk': `${path.resolve()}/src/adheseSdk`,
      '@adhese/sdk-shared': `${path.resolve()}/../sdk-shared/src`,
      '@adhese/sdk-shared/validators': `${path.resolve()}/../sdk-shared/src/validators`,
      /* eslint-enable ts/naming-convention */
    },
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
    },
    setupFiles: './vitest.setup.ts',
  },
});
