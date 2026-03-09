import { execSync } from 'node:child_process';
import { env } from 'node:process';
import { Command } from 'commander';
import { Octokit } from 'octokit';
import { array, object, string } from 'zod';

const program = new Command();

const ocktokit = new Octokit({
  auth: env.GITHUB_TOKEN,
});

program
  .name('nightly-comment')
  .description('Comment on PR with nightly build info');

program
  .option('-P, --packages <package>', 'Published packages')
  .option('-I, --pull-request <pull-request>', 'Pull request number')
  .action(async (options: {
    packages: string;
    pullRequest: number;
  }): Promise<void> => {
    const packages = array(object({
      name: string(),
      version: string(),
    })).parse(JSON.parse(options.packages));

    // Skip deprecation - nightly tag is sufficient to indicate development builds
    // Optionally clean up git tags created by changesets
    for (const pkg of packages) {
      try {
        execSync(`git tag -d ${pkg.name}@${pkg.version}`, { stdio: 'ignore' });
        execSync(`git push origin :refs/tags/${pkg.name}@${pkg.version}`, { stdio: 'ignore' });
      }
      catch {
        // Ignore errors if tags don't exist
      }
    }

    if (packages.length > 0) {
      await ocktokit.rest.issues.createComment({
        owner: 'adhese',
        repo: 'sdk_typescript',
        // eslint-disable-next-line ts/naming-convention
        issue_number: Number(options.pullRequest),
        body: `Created nightly build for the following packages:
        \n ${packages.map(pkg => `- \`${pkg.name}@${pkg.version}\``).join('\n')}
      `,
      });
    }
  });

program.parse();
