import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {

      /* eslint-disable ts/naming-convention */
      '@utils': `${path.resolve()}/../utils/src`,
      '@core': `${path.resolve()}/src`,
      '@devtools': `${path.resolve()}/../devtools/src`,
      '@logger': `${path.resolve()}/../logger/src`,
      '@server-mocks': `${path.resolve()}/../server-mocks/src`,
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
  },
});
