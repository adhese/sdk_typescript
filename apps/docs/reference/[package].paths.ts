import fs from 'node:fs/promises';
import { glob } from 'glob';
import { buildDocumentation, documentationToMarkdown } from 'tsdoc-markdown';

export default {
  async paths(): Promise<ReadonlyArray<{
    params: {
      package: string;
    };
    content: string;
  }>> {
    const gitignore = await fs.readFile('../../.gitignore', 'utf-8');
    const globPackages = await glob('../../packages/*', {
      ignore: gitignore.split('\n').filter(line => line !== '' && !line.startsWith('#')),
    });

    const packages = await Promise.all(globPackages.map(async (globPackage) => {
      const [
        packageJson,
        srcFileNames,
      ] = await Promise.all([
        (await fs.readFile(`${globPackage}/package.json`)).toString(),
        (await glob(`${globPackage}/src/**/*.ts`)).filter(fileName => !fileName.endsWith('.test.ts')),
      ]);
      const { name } = JSON.parse(packageJson) as { name: string };

      const docs = await Promise.all(srcFileNames.map(async srcFileName => ({
        md: documentationToMarkdown({
          entries: buildDocumentation({
            inputFiles: [srcFileName],
          }),
          options: {
            headingLevel: '###',
          },
        }),
        heading: srcFileName.split('/')[srcFileName.split('/').length - 1].replace('.ts', ''),
      })));

      return {
        name,
        docs,
        srcFileNames,
      };
    }));

    return packages.filter(({ srcFileNames, docs }) => srcFileNames.length > 0 && docs.length > 0 && !docs.every(({ md }) => md.trim() === '')).map(({ name, docs }) => ({
      params: {
        package: name.replace('/', '-'),
      },
      content: docs.filter(({ md }) => md.trim() !== '').map(({ md, heading }) => `## ${heading}\n\n${md}`).join('\n\n'),
    }));
  },
};
