import { execSync } from 'node:child_process';
import { type PluginOption, defineConfig } from 'vite';
import { flat } from 'remeda';
import { dependencies, peerDependencies } from './package.json';

function myPlugin(): PluginOption {
  const entries: Array<string> = [];

  return {
    name: 'my-plugin',
    apply: 'build',
    config(config): void {
      if (config.build?.lib) {
        const { entry } = config.build.lib;

        if (Array.isArray(entry))
          entries.push(...entry);
      }
    },
    closeBundle(): void {
      // eslint-disable-next-line no-console
      console.log();
      for (const entry of entries)
        execSync(`tsup ${entry} --dts-only --format esm --out-dir dist`, { stdio: 'inherit' });
    },
  };
}

export default defineConfig({
  plugins: [myPlugin()],
  build: {
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: ['src/index.ts', 'src/validators.ts'],
      name: '@adhese/sdk-shared',
      formats: ['es', 'cjs'],
      fileName: format => `[name].${format === 'cjs' ? 'cjs' : 'js'}`,
    },
    sourcemap: true,
    rollupOptions: {
      external: flat([
        ...(dependencies ? Object.keys(dependencies) : []),
        ...(peerDependencies ? Object.keys(peerDependencies) : []),
      ].map(dep => [dep, new RegExp(`^${dep}(/.*)?`)])),
      output: {
        inlineDynamicImports: false,
      },
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
