import type { Log } from '@adhese/sdk-shared';
import { type ReactElement, useEffect, useState } from 'react';
import { useAdheseContext } from '../AdheseContext';
import { Badge } from './badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

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
export function LogTable(): ReactElement {
  const [logs, setLogs] = useState<ReadonlyArray<Log<string>>>([]);

  const adheseContext = useAdheseContext();

  useEffect(() => {
    function onLogsChange(): void {
      setLogs(
        adheseContext?.logger?.getLogs().toSorted(
          (a, b) => b.timestamp - a.timestamp,
        ) ?? [],
      );
    }

    adheseContext?.logger?.events.log.addListener(onLogsChange);

    onLogsChange();

    return (): void => {
      adheseContext?.logger?.events.log.removeListener(onLogsChange);
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
                {log.level}
              </Badge>
            </TableCell>
            <TableCell>{log.message}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
