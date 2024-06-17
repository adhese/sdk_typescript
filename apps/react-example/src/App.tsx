import { type ReactElement, useEffect, useState } from 'react';
import { AdheseProvider } from '@adhese/sdk-react';
import type { AdhesePlugin } from '@adhese/sdk';
import { Child } from './Child';

// eslint-disable-next-line ts/naming-convention
export function App(): ReactElement {
  const [plugins, setPlugins] = useState<ReadonlyArray<AdhesePlugin>>([]);

  useEffect(() => {
    Promise
      .all([
        import('@adhese/sdk-devtools').then(({ devtoolsPlugin }) => devtoolsPlugin),
        import('@adhese/sdk-stack-slots').then(({ stackSlotsPlugin }) => stackSlotsPlugin),
      ])
      .then(setPlugins)
      .catch(console.error);
  }, []);

  return (
    <AdheseProvider options={plugins.length > 0
      ? {
          account: 'demo',
          debug: true,
          location: '_sdk_example_',
          plugins,
        }
      : undefined}
    >
      <Child />
    </AdheseProvider>
  );
}
