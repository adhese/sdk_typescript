import type { ReactElement } from 'react';
import { devtoolsPlugin } from '@adhese/sdk-devtools';
import { AdheseProvider } from '@adhese/sdk-react';
import { Child } from './Child';

// eslint-disable-next-line ts/naming-convention
export function App(): ReactElement {
  return (
    <AdheseProvider options={{
      account: 'aholdtest',
      debug: true,
      location: 'ah_website_nl',
      // @ts-expect-error plugin is on cdn
      plugins: [devtoolsPlugin, adhesePlugin],
      initialSlots: Array.from({ length: 5 }, (_, index) => ([
        {
          format: 'flex',
          slot: `_home_${index + 1}_1`,
        },
        {
          format: 'flex',
          slot: `_home_${index + 1}_2`,
        },
      ])).flat(),
      consent: true,
      parameters: {
        ab: 'a',
        om: '0',
        um: '1',
        mi: '',
        cu: 'u',
      },
    }}
    >
      <Child />
    </AdheseProvider>
  );
}
