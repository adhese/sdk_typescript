import path from 'node:path';
import { defineConfig } from 'vite';
import { viteBaseConfig } from '../../vite.baseConfig';
import { dependencies, name, peerDependencies } from './package.json';

export default defineConfig({
  ...viteBaseConfig({
    name,
    dependencies,
    peerDependencies,
    entries: 'src/gambit.ts',
  }),
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@adhese/sdk-shared': `${path.resolve()}/../sdk-shared/src`,
      '@server-mocks': `${path.resolve()}/../server-mocks/src`,
      /* eslint-enable ts/naming-convention */
    },
  },
});
