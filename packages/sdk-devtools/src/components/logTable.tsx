import { type ReactElement, useEffect, useState } from 'react';
import type { AdheseContext } from '@core';
import type { Log } from '@logger';
import upperFirst from 'lodash/upperFirst';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Badge } from './badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
import { buttonVariants } from './button';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  fractionalSecondDigits: 3,
  hour12: false,
});

const logTableRowClasses: Record<string, string> = {
  error: 'bg-red-100 text-red-900',
  warn: 'bg-amber-100 text-amber-900',
};

const logBadgeClasses: Record<string, string> = {
  error: 'bg-red-500 text-white',
  warn: 'bg-amber-500 text-white',
  info: 'bg-blue-500 text-white',
};

// eslint-disable-next-line ts/naming-convention
export function LogTable({
  adheseContext,
}: {
  adheseContext: AdheseContext;
}): ReactElement {
  const [logs, setLogs] = useState<ReadonlyArray<Log<string>>>([]);

  useEffect(() => {
    function onLogsChange(): void {
      setLogs(
        adheseContext.logger.getLogs().toSorted(
          (a, b) => b.timestamp - a.timestamp,
        ),
      );
    }

    adheseContext.logger.events.log.addListener(onLogsChange);

    onLogsChange();

    return (): void => {
      adheseContext.logger.events.log.removeListener(onLogsChange);
    };
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Scope</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Attributes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map(log => (
          <TableRow key={log.id} className={logTableRowClasses[log.level] ?? ''}>
            <TableCell>{dateFormatter.format(new Date(log.timestamp))}</TableCell>
            <TableCell>{log.scope}</TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={logBadgeClasses[log.level] ?? ''}
              >
                {upperFirst(log.level)}
              </Badge>
            </TableCell>
            <TableCell>{log.message}</TableCell>
            <TableCell>
              {Boolean(log.attributes) && (
                <Sheet>
                  <SheetTrigger className={buttonVariants({
                    variant: 'secondary',
                    size: 'sm',
                  })}
                  >
                    Show
                  </SheetTrigger>
                  <SheetContent className="bg-white flex flex-col gap-4">
                    <SheetHeader>
                      <SheetTitle>
                        Attributes
                      </SheetTitle>
                    </SheetHeader>
                    <pre className="p-4 bg-accent overflow-auto max-h-full text-sm rounded-md">
                      {JSON.stringify(log.attributes, null, 2)}
                    </pre>
                  </SheetContent>
                </Sheet>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
