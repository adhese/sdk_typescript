import type { ReactElement } from 'react';
import { Child } from './Child';
import { AdheseProvider } from './adheseContext';

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
