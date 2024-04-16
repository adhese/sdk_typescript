import type { ReactElement } from 'react';
import { AdheseProvider } from '@react-sdk';
import { createDevtools } from '@adhese/sdk-devtools';
import { Child } from './Child';

// eslint-disable-next-line ts/naming-convention
export function App(): ReactElement {
  return (
    <AdheseProvider options={{
      account: 'demo',
      debug: true,
      location: '_sdk_example_',
      plugins: [createDevtools],
    }}
    >
      <Child />
    </AdheseProvider>
  );
}
