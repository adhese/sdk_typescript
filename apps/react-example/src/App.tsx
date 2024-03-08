import type { ReactElement } from 'react';
import { AdheseProvider } from '@react-sdk';
import { Child } from './Child';

// eslint-disable-next-line ts/naming-convention
export function App(): ReactElement {
  return (
    <AdheseProvider options={{
      account: 'demo',
      debug: true,
      location: '_sdk_example_',
    }}
    >
      <Child />
    </AdheseProvider>
  );
}
