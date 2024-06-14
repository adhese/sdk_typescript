import path from 'node:path';
import { defineConfig } from 'vite';
import { viteBaseConfig } from '../../vite.baseConfig';
import { dependencies, name, peerDependencies } from './package.json';

export default defineConfig({
  ...viteBaseConfig({
    name,
    dependencies,
    peerDependencies,
    entries: 'src/vastUrl.ts',
  }),
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@adhese/sdk': `${path.resolve()}/../sdk/src/adheseSdk`,
      '@adhese/sdk-shared': `${path.resolve()}/../sdk-shared/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/types/*.ts'],
    },
    setupFiles: './vitest.setup.ts',
  },
});
