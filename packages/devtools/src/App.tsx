import type { AdheseContext } from '@core';
import { type ReactElement, useEffect, useRef, useState } from 'react';
import './globals.css';
import { SlotsTable } from './components/slotsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/tabs';
import { LogTable } from './components/logTable';

// eslint-disable-next-line ts/naming-convention
export function App({ adheseContext }: {
  adheseContext: AdheseContext;
}): ReactElement {
  const [spacing, setSpacing] = useState(0);
  const appRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      setSpacing(entry.target.getBoundingClientRect().height);
    },
    );

    if (appRef.current)
      resizeObserver.observe(appRef.current);

    return (): void => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div className="fixed bottom-0 w-full border-t-2 border-t-accent p-4 bg-background shadow-lg overflow-auto" ref={appRef}>
        <Tabs defaultValue="slots">
          <TabsList>
            <TabsTrigger value="slots">Slots</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          <div className="overflow-auto max-h-96 border-t-2 border-t-accent mt-2">
            <TabsContent value="slots">
              <SlotsTable adheseContext={adheseContext} />
            </TabsContent>
            <TabsContent value="logs">
              <LogTable adheseContext={adheseContext} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <div style={{
        height: spacing,
      }}
      />
    </>
  );
}
