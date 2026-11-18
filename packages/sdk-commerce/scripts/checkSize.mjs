import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { gzipSync } from 'node:zlib';

// The insights tag has a hard budget; the ads bundle includes the SDK, so it only has a generous ceiling.
const budgets = [
  { file: 'insights.min.js', limitBytes: 4 * 1024 },
  { file: 'ads.min.js', limitBytes: 60 * 1024 },
];

// The tags run in the browser: a leftover Node global makes the whole bundle throw at load time.
const bundles = await Promise.all(budgets.map(async ({ file }) => readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8')));
const leaks = bundles.flatMap((code, index) => (/\bprocess\.env\b/.test(code) ? [budgets[index].file] : []));

for (const file of leaks)
  console.error(`${file} references process.env`);

const results = await Promise.all(budgets.map(async ({ file, limitBytes }) => ({
  file,
  limitBytes,
  size: gzipSync(await readFile(new URL(`../dist/${file}`, import.meta.url)), { level: 9 }).length,
})));

for (const { file, limitBytes, size } of results) {
  console.log(`${file}: ${size} B gzipped (limit ${limitBytes} B)`);
  if (size > limitBytes)
    console.error(`${file} exceeds the size budget`);
}

if (leaks.length > 0 || results.some(({ size, limitBytes }) => size > limitBytes))
  process.exit(1);
