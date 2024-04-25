import type { ReactElement } from 'react';
import { AdheseProvider } from '@adhese/sdk-react';
import { createDevtools } from '@adhese/sdk-devtools';
import { Child } from './Child';

// eslint-disable-next-line ts/naming-convention
export function App(): ReactElement {
  return (
    <AdheseProvider options={{
      account: 'aholdtest',
      debug: true,
      location: 'ah.nl_homepage',
      plugins: [createDevtools],
      consent: true,
      parameters: {
        ab: "a",
        om: "0",
        um: "1",
        mi: "", 
        cu: "u"
      }
    }}
    >
      <Child />
    </AdheseProvider>
  );
}
