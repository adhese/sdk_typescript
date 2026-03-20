const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Monorepo root
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Resolve packages from monorepo root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Teach Metro to resolve Node.js subpath exports (e.g. @adhese/sdk/core, @adhese/sdk-shared/core)
// Metro doesn't support the "exports" field in package.json, so we resolve these manually.
const subpathExports = {
  '@adhese/sdk/core': path.resolve(monorepoRoot, 'packages/sdk/dist/core.js'),
  '@adhese/sdk-shared/core': path.resolve(monorepoRoot, 'packages/sdk-shared/dist/core.js'),
  '@adhese/sdk-shared/validators': path.resolve(monorepoRoot, 'packages/sdk-shared/dist/validators.js'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (subpathExports[moduleName]) {
    return {
      filePath: subpathExports[moduleName],
      type: 'sourceFile',
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
