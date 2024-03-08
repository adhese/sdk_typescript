import { type ReactElement, useMemo, useState } from 'react';
import { AdheseSlot } from './AdheseSlot';

// eslint-disable-next-line ts/naming-convention
export function Child(): ReactElement {
  const [isSlotShown, setIsSlotShown] = useState(true);
  return (
    <>
      <button onClick={() => { setIsSlotShown(value => !value); }}>Toggle slot</button>
      {
        isSlotShown && (
          <AdheseSlot options={{
            format: 'skyscraper',
          }}
          />
        )
      }
      <div
        style={{
          height: `calc(100vh + 400px)`,
          border: '4px solid red',
        }}
      >
        spacer
      </div>
      <AdheseSlot options={useMemo(() => ({
        format: 'leaderboard',
      }), [])}
      />
      <AdheseSlot options={useMemo(() => ({
        format: 'imu',
        lazyLoading: true,
      }), [])}
      />
    </>
  );
}
