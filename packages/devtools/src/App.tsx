import type { AdheseContext } from '@core';
import { type ReactElement, useEffect, useRef, useState } from 'react';
import './globals.css';
import { SlotsTable } from './components/slotsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/tabs';
import { LogTable } from './components/logTable';
import { Button } from './components/button';
import { ParametersTable } from './components/parametersTable';

// eslint-disable-next-line ts/naming-convention
export function App({ adheseContext }: {
  adheseContext: AdheseContext;
}): ReactElement {
  const [spacing, setSpacing] = useState(0);
  const appRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let resizeObserver: ResizeObserver | undefined;

    if (isOpen) {
      resizeObserver = new ResizeObserver(([entry]) => {
        setSpacing(entry.target.getBoundingClientRect().height);
      },
      );

      if (appRef.current)
        resizeObserver.observe(appRef.current);
    }

    return (): void => {
      resizeObserver?.disconnect();
    };
  }, [isOpen]);

  return (
    <div className="adhese-devtools">
      {isOpen
        ? (
          <>
            <section
              className="fixed bottom-0 w-full border-t-2 border-t-accent bg-background shadow-lg overflow-auto"
              ref={appRef}
              aria-label="Adhese Devtools"
            >
              <Tabs defaultValue="slots">
                <div className="flex justify-between  p-4">
                  <TabsList>
                    <TabsTrigger value="slots">Slots</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                    <TabsTrigger value="parameters">Parameters</TabsTrigger>
                  </TabsList>
                  <Button
                    onClick={setIsOpen.bind(null, false)}
                  >
                    Close
                  </Button>
                </div>
                <div className="overflow-auto max-h-96 border-t-2 border-t-accent p-4">
                  <TabsContent value="slots">
                    <SlotsTable adheseContext={adheseContext} />
                  </TabsContent>
                  <TabsContent value="logs">
                    <LogTable adheseContext={adheseContext} />
                  </TabsContent>
                  <TabsContent value="parameters">
                    <ParametersTable adheseContext={adheseContext} />
                  </TabsContent>
                </div>
              </Tabs>
            </section>
            <div style={{
              height: spacing,
            }}
            />
          </>
          )
        : (
          <Button
            className="fixed bottom-4 right-4"
            onClick={setIsOpen.bind(null, true)}
          >
            Open Adhese Devtools
          </Button>
          )}
    </div>
  );
}
