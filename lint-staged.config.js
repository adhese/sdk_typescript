export default { '**/*.{ts,js,json,cjs,mjs,cts,mts,yaml}': (fileNames) => {
  const conditions = ['packages', 'apps'];
  const workspaceFiles = fileNames
    .filter(fileName => conditions.some(condition => fileName.includes(condition)));

  return [
      `turbo lint:fix -- ${workspaceFiles.join(' ')}`,
      `eslint ${fileNames.join(' ')} --ignore-pattern packages apps --fix`,
  ];
},
};
