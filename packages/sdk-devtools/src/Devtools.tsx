import { type ReactElement, useRef, useState } from 'react';
import { Button } from './components/button';
import { LogTable } from './components/logTable';
import { ParametersTable } from './components/parametersTable';
import { PreviewButton } from './components/previewButton';
import { Settings } from './components/settings';
import { SlotsTable } from './components/slotsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/tabs';
import { useSpacing } from './Devtools.hooks';
import './globals.css';

// eslint-disable-next-line ts/naming-convention
export function Devtools(): ReactElement {
  const appRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const spacing = useSpacing(isOpen, appRef);

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
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                      <PreviewButton />
                      <Button
                        onClick={setIsOpen.bind(null, false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-auto max-h-96 border-t-2 border-t-accent p-4">
                    <TabsContent value="slots">
                      <SlotsTable />
                    </TabsContent>
                    <TabsContent value="logs">
                      <LogTable />
                    </TabsContent>
                    <TabsContent value="parameters">
                      <ParametersTable />
                    </TabsContent>
                    <TabsContent value="settings">
                      <Settings />
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
            <div className="fixed bottom-4 right-4 flex flex-col gap-2">
              <Button onClick={setIsOpen.bind(null, true)}>
                Open Adhese Devtools
              </Button>
              <PreviewButton />
            </div>
          )}
    </div>
  );
}
