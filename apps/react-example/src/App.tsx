import type { ReactElement } from 'react';
import { AdheseProvider } from '@adhese/sdk-react';
import { stackSlotsPlugin } from '@adhese/sdk-stack-slots';
import { devtoolsPlugin } from '@adhese/sdk-devtools';
import { Child } from './Child';

// eslint-disable-next-line ts/naming-convention
export function App(): ReactElement {
  return (
    <AdheseProvider options={{
      account: 'demo',
      debug: true,
      location: '_sdk_example_',
      plugins: [devtoolsPlugin, stackSlotsPlugin],
    }}
    >
      <Child />
    </AdheseProvider>
  );
}
