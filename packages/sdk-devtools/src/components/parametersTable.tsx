import { watch } from '@adhese/sdk-shared';
import { type ReactElement, useEffect, useState } from 'react';
import { useAdheseContext } from '../AdheseContext';
import { Badge } from './badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

// eslint-disable-next-line ts/naming-convention
export function ParametersTable(): ReactElement {
  const [parameters, setParameters] = useState<ReadonlyArray<{
    name: string;
    value: string | ReadonlyArray<string>;
  }>>([]);

  const adheseContext = useAdheseContext();

  useEffect(() => {
    if (!adheseContext)
      return;

    const disposeWatcher = watch(() => adheseContext.parameters, (newParameters) => {
      setParameters(Array.from(newParameters.entries())
        .map(([name, value]) => ({
          name,
          value,
        }))
        .filter(({ value }) => value)
        .toSorted((a, b) => a.name.localeCompare(b.name)));
    }, {
      immediate: true,
      deep: true,
    });

    return (): void => {
      disposeWatcher();
    };
  }, [adheseContext?.parameters]);

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
