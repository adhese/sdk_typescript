import { type ChangeEventHandler, type HTMLAttributes, type ReactElement, useCallback, useId, useMemo, useState } from 'react';
import { deleteCookie, getCookie, hasCookie, setCookie } from '@adhese/sdk-shared';
import { cn } from '../utils';
import { useAdheseContext } from '../AdheseContext';
import { Switch } from './switch';
import { Label } from './label';
import { Input } from './input';
import { Button } from './button';

const cookieKey = 'debugKey';

function setDebugCookie(value: string): void {
  setCookie({
    key: cookieKey,
    value,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
}

function simpleStringify(value: unknown): string {
  if (typeof value === 'object')
    return Object.values(value as object).map(nestedValue => `${simpleStringify(nestedValue)}`).join('');

  if (typeof value === 'boolean')
    return value ? '1' : '0';

  return String(value);
}

// eslint-disable-next-line ts/naming-convention
export function FronttailSettings({
  className,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement {
  const adheseContext = useAdheseContext()!;

  const autoGeneratedKey = useMemo(() => `adhese-${adheseContext.options.account}-${btoa(simpleStringify(adheseContext.options)).slice(0, 20)}`, [adheseContext.options]);

  const [fronttailDebugKey, setFronttailDebugKey] = useState(getCookie(cookieKey) ?? autoGeneratedKey);
  const [isFronttailEnabled, setIsFronttailEnabled] = useState(hasCookie(cookieKey));

  const onFronttailDebugKeyChange = useCallback((event) => {
    const { value } = event.target;

    setFronttailDebugKey(value);

    if (isFronttailEnabled && value.length > 4)
      setDebugCookie(value);
  }, [setDebugCookie, isFronttailEnabled]) satisfies ChangeEventHandler<HTMLInputElement>;

  const onFrontailEnabledChange = useCallback(() => {
    setIsFronttailEnabled((value) => {
      if (value)
        deleteCookie(cookieKey);

      else
        setDebugCookie(fronttailDebugKey);

      return !value;
    });
  }, [setDebugCookie, fronttailDebugKey]);

  const id = useId();
  return (
    <section className={cn('flex flex-col gap-6', className)} aria-labelledby={ariaLabelledBy ?? `fronttailHeading${id}`} {...props}>
      <h2 className="text-lg font-semibold" id={`fronttailHeading${id}`}>Fronttail settings</h2>

      <div className="flex items-center gap-4">
        <Switch checked={isFronttailEnabled} onCheckedChange={onFrontailEnabledChange} id={`fronttailSwitch${id}`} />
        <Label htmlFor={`fronttailSwitch${id}`}>
          Enable Fronttail debugging
          <span className="text-gray-400 font-normal"> – Cookie will expire automatically in 1 day</span>
        </Label>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`fronttailDebugKey${id}`}>
          Debug key
        </Label>
        <div className="flex items-center gap-4">
          <Input
            id={`fronttailDebugKey${id}`}
            value={fronttailDebugKey}
            onChange={onFronttailDebugKeyChange}
            className={
              cn('max-w-60', {
                // eslint-disable-next-line ts/naming-convention
                'border-destructive': fronttailDebugKey.length < 4,
              })
            }
          />

          <Button
            variant="outline"
            onClick={() => {
              setFronttailDebugKey(autoGeneratedKey);

              if (isFronttailEnabled)
                setDebugCookie(autoGeneratedKey);
            }}
          >
            Auto generate key
          </Button>
        </div>
        {
          fronttailDebugKey.length < 4
          && <span className="text-sm text-destructive">Debug key must contain at least 4 characters</span>
        }
      </div>
    </section>
  );
}
