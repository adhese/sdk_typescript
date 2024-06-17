import { execSync } from 'node:child_process';
import { env } from 'node:process';
import { Command } from 'commander';
import { array, object, string } from 'zod';
import { Octokit } from 'octokit';

const program = new Command();

const ocktokit = new Octokit({
  auth: env.GITHUB_TOKEN,
});

program
  .name('deprecate-nightly')
  .description('Deprecate a nightly package');

program
  .option('-P, --packages <package>', 'Package to deprecate')
  .option('-I, --pull-request <pull-request>', 'Pull request to deprecate')
  .action(async (options: {
    packages: string;
    pullRequest: number;
  }): Promise<void> => {
    const packages = array(object({
      name: string(),
      version: string(),
    })).parse(JSON.parse(options.packages));

    for (const pkg of packages) {
      execSync(`npm deprecate ${pkg.name}@${pkg.version} "This package is a nightly build and is deprecated by default. Please use the latest stable version unless you know what you are doing."`);
      execSync(`git tag -d ${pkg.name}@${pkg.version}`);
      execSync(`git push origin :refs/tags/${pkg.name}@${pkg.version}`);
    }

    if (packages.length > 0) {
      await ocktokit.rest.issues.createComment({
        owner: 'adhese',
        repo: 'sdk_typescript',
        // eslint-disable-next-line ts/naming-convention
        issue_number: Number(options.pullRequest),
        body: `Created nightly build for the following packages:
        ${packages.map(pkg => `- \`${pkg.name}@${pkg.version}\``).join('\n')}
      `,
      });
    }
  });

program.parse();
