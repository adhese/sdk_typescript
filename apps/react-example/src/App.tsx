import type { ReactElement } from 'react';
import { devtoolsPlugin } from '@adhese/sdk-devtools';
import { AdheseProvider } from '@adhese/sdk-react';
import { Child } from './Child';

// eslint-disable-next-line ts/naming-convention
export function App(): ReactElement {
  return (
    <AdheseProvider options={{
      account: 'demo',
      debug: true,
      location: '_sdk_example_',
      plugins: [devtoolsPlugin],
      initialSlots: [
        {
          format: 'skyscraper',
        },
        {
          format: 'leaderboard',
        },
      ],
    }}
    >
      <Child />
    </AdheseProvider>
  );
}
