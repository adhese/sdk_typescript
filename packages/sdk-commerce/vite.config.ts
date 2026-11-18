import path from 'node:path';
import process from 'node:process';
import { defineConfig } from 'vite';

/**
 * Both tags are standalone IIFEs (`insights.min.js`, `ads.min.js`) built one after the other with `ENTRY=...`. They
 * deliberately do not use the shared monorepo base config, which builds unminified multi-file ES/CJS libraries.
 *
 * `ads` bundles `@adhese/sdk` and its plugins from the monorepo sources; `insights` has no dependencies.
 */
const entry = process.env.ENTRY === 'ads' ? 'ads' : 'insights';
const packages = path.resolve(__dirname, '..');

export default defineConfig({
  resolve: {
    alias: {
      /* eslint-disable ts/naming-convention */
      '@adhese/sdk-stack-slots': path.join(packages, 'sdk-stack-slots/src/stackSlots.ts'),
      '@adhese/sdk-safe-frame': path.join(packages, 'sdk-safe-frame/src/safeFrame.ts'),
      '@adhese/sdk-shared': path.join(packages, 'sdk-shared/src'),
      '@adhese/sdk': path.join(packages, 'sdk/src/adheseSdk.ts'),
      /* eslint-enable ts/naming-convention */
    },
  },
  // Library mode does not replace this, and the SDK's reactivity dependency reads it at load time.
  // eslint-disable-next-line ts/naming-convention
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    emptyOutDir: entry === 'insights',
    minify: 'esbuild',
    target: 'es2020',
    lib: {
      entry: `src/${entry}/index.ts`,
      name: entry === 'ads' ? 'AdheseCommerceAds' : 'AdheseCommerceInsights',
      formats: ['iife'],
      fileName: () => `${entry}.min.js`,
    },
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
    },
  },
});
