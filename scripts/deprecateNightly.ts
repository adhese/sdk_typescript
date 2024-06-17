import { execSync } from 'node:child_process';
import { Command } from 'commander';
import { array, object, string } from 'zod';

const program = new Command();

program
  .name('deprecate-nightly')
  .description('Deprecate a nightly package');

program
  .option('-P, --packages <package>', 'Package to deprecate')
  .action((options: {
    packages: string;
  }): void => {
    const packages = array(object({
      name: string(),
      version: string(),
    })).parse(JSON.parse(options.packages));

    for (const pkg of packages) {
      execSync(`npm deprecate ${pkg.name}@${pkg.version} "This package is a nightly build and is deprecated by default. Please use the latest stable version unless you know what you are doing."`);
      execSync(`git tag -d ${pkg.name}@${pkg.version}`);
      execSync(`git push origin :refs/tags/${pkg.name}@${pkg.version}`);
    }
  });

program.parse();
