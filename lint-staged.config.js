import { execSync } from 'node:child_process';

export default {
  '**/*.{ts,tsx,js,jsx,json,cjs,mjs,cts,mts,yaml,yml}': (fileNames) => {
    const gitUser = execSync('git config user.name').toString().trim();

    if (gitUser === 'github-actions[bot]')
      return [];

    return [`eslint --fix ${fileNames.join(' ')}`];
  },
  '**/*.{ts,tsx,js,jsx}': () => ['npm run test'],
  '**/*.{ts,tsx,cts,mts}': () => ['npm run typecheck'],
};
