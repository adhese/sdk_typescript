import type { AdheseContext } from '@core';
import { type ReactElement, useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Badge } from './badge';

// eslint-disable-next-line ts/naming-convention
export function ParametersTable({
  adheseContext,
}:
{
  adheseContext: AdheseContext;
}): ReactElement {
  const [parameters, setParameters] = useState<ReadonlyArray<{
    name: string;
    value: string | ReadonlyArray<string>;
  }>>([]);

  useEffect(() => {
    function onParametersChange(): void {
      setParameters(Array.from(adheseContext.parameters?.entries() ?? []).map(([name, value]) => ({
        name,
        value,
      })).toSorted((a, b) => a.name.localeCompare(b.name)));
    }

    adheseContext.events?.parametersChange.addListener(onParametersChange);

    onParametersChange();

    return (): void => {
      adheseContext.events?.parametersChange.removeListener(onParametersChange);
    };
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Parameter</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {parameters.map(parameter => (
          <TableRow key={parameter.name}>
            <TableCell>
              <Badge variant="outline">{parameter.name}</Badge>
            </TableCell>
            <TableCell>
              {
                Array.isArray(parameter.value)
                  ? (
                    <ul className="flex gap-1">
                      {parameter.value.map((item, index) => (
                        <li key={index}>
                          <Badge variant="outline">{item}</Badge>
                        </li>
                      ))}
                    </ul>
                    )
                  : <Badge variant="outline">{parameter.value}</Badge>
              }
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
