import { viteBaseConfig } from '../../vite.baseConfig';
import { dependencies, name, peerDependencies } from './package.json';

export default viteBaseConfig({
  name,
  dependencies,
  peerDependencies,
  entries: 'src/safeFrame.ts',
});
