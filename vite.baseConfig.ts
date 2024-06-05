import { execSync } from 'node:child_process';
import { type LibraryOptions, type PluginOption, type UserConfig, defineConfig } from 'vite';
import { flat } from 'remeda';

export function viteBaseConfig({ dependencies = {}, peerDependencies = {}, devDependencies = {}, entries, plugins = [], name, bundle = false }: {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  name: string;
  entries: LibraryOptions['entry'];
  plugins?: UserConfig['plugins'];
  bundle?: boolean;
}): UserConfig {
  return defineConfig({
    plugins: [
      ((): PluginOption => {
        const buildEntries: Array<string> = [];

        return ({
          name: 'dts',
          config(config): void {
            if (config.build?.lib) {
              const { entry } = config.build.lib;

              if (Array.isArray(entry))
                buildEntries.push(...entry);
              else
                buildEntries.push(entry as string);
            }
          },
          closeBundle(): void {
            // eslint-disable-next-line no-console
            console.log();

            const external = [dependencies, peerDependencies, devDependencies].flatMap(Object.keys);

            for (const entry of buildEntries)
              execSync(`tsup ${entry} --dts-only --format esm --out-dir dist ${external.map(pack => ` --external ${pack}`).join(' ')}`, { stdio: 'inherit' });
          },
        });
      })(),
      ...plugins,
    ],
    build: {
      emptyOutDir: true,
      minify: false,
      lib: {
        entry: entries,
        name,
        formats: ['es', 'cjs'],
        fileName: format => `${format === 'cjs' ? 'cjs/' : ''}[name].${format === 'cjs' ? 'cjs' : 'js'}`,
      },
      sourcemap: true,
      rollupOptions: {
        external: flat([
          ...Object.keys(dependencies),
          ...Object.keys(peerDependencies),
        ].map(dep => [dep, new RegExp(`^${dep}(/.*)?`)])),
        output: {
          inlineDynamicImports: false,
          ...(bundle
            ? {
                preserveModulesRoot: 'src',
                preserveModules: false,
              }
            : {
                preserveModulesRoot: 'src',
                preserveModules: true,
              }),
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
}
