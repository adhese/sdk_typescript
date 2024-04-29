import { execSync } from 'node:child_process';

export default {
  '**/*.{ts,tsx,js,jsx,json,cjs,mjs,cts,mts,yaml,yml}': (fileNames) => {
    const gitUser = execSync('git config user.name').toString().trim();

    if (gitUser === 'github-actions[bot]')
      return [];

    const workspaces = ['packages', 'apps'];
    const workspaceFiles = fileNames
      .filter(fileName => workspaces.some(workspace => fileName.includes(workspace)));
    const nonWorkspaceFiles = fileNames
      .filter(fileName => !workspaces.some(workspace => fileName.includes(workspace)));

    return [
      workspaceFiles.length > 0 && `turbo lint:fix -- ${workspaceFiles.join(' ')}`,
      nonWorkspaceFiles.length > 0 && `eslint ${nonWorkspaceFiles.join(' ')} ${workspaces.map(workspace => `--ignore-pattern ${workspace}`).join(' ')}  --fix`,
      'npm run test',
      'npm run typecheck',
    ].filter(Boolean);
  },
};
