import type { ReactElement } from 'react';
import { toOptions } from '@adhese/sdk-gambit';
import { AdheseProvider } from '@adhese/sdk-react';
import { createDevtools } from '@adhese/sdk-devtools';
import { Child } from './Child';

// eslint-disable-next-line ts/naming-convention
export function App(): ReactElement {
  return (
    <AdheseProvider options={{
      ...toOptions({
        account: 'demo',
        options: {
          debug: true,
        },
        data: {
          pagePath: '_sdk_example_',
        },
      }),
      ...{
        plugins: [createDevtools],
      },
    }}
    >
      <Child />
    </AdheseProvider>
  );
}
