import path from 'node:path';
import { defineConfig } from 'vite';
import { viteBaseConfig } from '../../vite.baseConfig';
import { dependencies, devDependencies, name } from './package.json';

export default defineConfig({
  ...viteBaseConfig({
    name,
    dependencies,
    devDependencies,
    entries: 'src/sdkLite.ts',
    bundle: true,
  }),
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@server-mocks': `${path.resolve()}/../server-mocks/src`,
      '@adhese/sdk-lite': `${path.resolve()}/src/sdkLite.ts`,
      '@adhese/sdk': `${path.resolve()}/../sdk/src`,
      '@adhese/sdk-shared': `${path.resolve()}/../sdk-shared/src`,
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
