import type { AdheseAd, AdheseSlot } from '@adhese/sdk';
import type { DevtoolsSlotPluginOptions } from '../devtools.composables';
import { generateName, type UnwrapRef, watch } from '@adhese/sdk-shared';
import { ResetIcon } from '@radix-ui/react-icons';
import { Fragment, type ReactElement, useEffect, useMemo, useState } from 'react';
import { useAdheseContext } from '../AdheseContext';
import { useModifiedSlots } from '../modifiedSlots.store';
import { cn } from '../utils';
import { Badge } from './badge';
import { Button, buttonVariants } from './button';
import { EditSlot } from './editSlot';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

export const slotIndexBadgeClasses = [
  'bg-blue-500 hover:bg-blue-500',
  'bg-amber-500 hover:bg-amber-500',
  'bg-green-500 hover:bg-green-500',
  'bg-red-500 hover:bg-red-500',
  'bg-purple-500 hover:bg-purple-500',
  'bg-cyan-500 hover:bg-cyan-500',
  'bg-pink-500 hover:bg-pink-500',
] as const;

const renderStatusMap = {
  initializing: 'Initializing',
  initialized: 'Initialized',
  loading: 'Loading',
  loaded: 'Loaded',
  rendering: 'Rendering',
  rendered: 'Rendered',
  empty: 'Empty',
  error: 'Error',
} as const satisfies Record<UnwrapRef<AdheseSlot['status']>, string>;

// eslint-disable-next-line ts/naming-convention
export function SlotsTable(): ReactElement {
  const [slots, setSlots] = useState<ReadonlyArray<AdheseSlot>>([]);

  const adheseContext = useAdheseContext();

  useEffect(() => {
    if (!adheseContext)
      return;

    const disposeWatcher = watch(() => adheseContext.slots, (newSlots) => {
      setSlots(Array.from(newSlots.values()));
    }, { immediate: true, deep: true });

    return (): void => {
      disposeWatcher();
    };
  }, [adheseContext]);
  const modifiedSlots = useModifiedSlots();

  const formattedSlots = useMemo(() => slots
    .filter(slot => !(slot.pluginOptions?.devtools as DevtoolsSlotPluginOptions)?.hijackedSlot)
    .map((slot) => {
      const hijackedSlotOptions = modifiedSlots.slots.get(slot.name);
      const hijackedSlot = (adheseContext && hijackedSlotOptions) && adheseContext.get?.(generateName(adheseContext.location, hijackedSlotOptions.format, hijackedSlotOptions.slot));

      let interimSlot = hijackedSlot ?? slot;

      if (interimSlot.data?.origin === 'DALE') {
        // @ts-expect-error - Data structure is not typed and very messy to type

        const nestedAdheseData = interimSlot.data?.originData?.seatbid[0]?.bid[0]?.ext?.adhese as AdheseAd;

        interimSlot = {
          ...interimSlot,
          data: {
            ...interimSlot.data,
            ...nestedAdheseData,
          },
        };
      }

      return ({
        ...interimSlot,
        parameters: Array.from((hijackedSlot ?? slot).parameters.entries()),
        hijackedSlot,
        originalSlot: slot,
      });
    })
    .toSorted((a, b) => {
      const offsetA = a.element?.getBoundingClientRect().top ?? 0;
      const offsetB = b.element?.getBoundingClientRect().top ?? 0;

      return offsetA - offsetB;
    }), [slots]);

  const slotParametersExist = useMemo(() => formattedSlots.some(formattedSlot => formattedSlot.parameters.length > 0), [formattedSlots]);
  const previewExist = useMemo(() => formattedSlots.some(formattedSlot => formattedSlot.data?.preview), [formattedSlots]);
  const slotCodeExists = useMemo(() => formattedSlots.some(formattedSlot => formattedSlot.slot), [formattedSlots]);

  const origins: ReadonlyArray<string> = useMemo(() => {
    const set = new Set<string>();

    for (const slot of formattedSlots) {
      const { data } = slot;

      if (data)
        set.add(data.origin);
    }

    return Array.from(set);
  }, [formattedSlots]);

  return (
    adheseContext && (formattedSlots.length > 0)
      ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                {slotCodeExists && <TableHead>Slot</TableHead>}
                <TableHead>Format</TableHead>
                {origins.length > 1 && <TableHead>Origin</TableHead>}
                <TableHead>Render Status</TableHead>
                <TableHead>Campaign ID</TableHead>
                <TableHead>Booking ID</TableHead>
                <TableHead>Creative ID</TableHead>
                <TableHead>Traffic ID</TableHead>
                <TableHead>Creative type</TableHead>
                <TableHead>Impression tracked</TableHead>
                <TableHead>Viewability tracked</TableHead>
                {
                  slotParametersExist && <TableHead>Parameters</TableHead>
                }
                {
                  previewExist && <TableHead>Preview</TableHead>
                }
                <TableHead>Controls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formattedSlots.map(({
                data,
                name,
                format,
                location,
                status,
                isViewabilityTracked,
                isImpressionTracked,
                element,
                parameters,
                slot,
                hijackedSlot,
                originalSlot,
              }, index) => (
                <Fragment key={originalSlot.id}>
                  <TableRow id={name}>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => {
                          if (element) {
                            element.scrollIntoView();
                            element.style.outline = 'solid 5px red';

                            setTimeout(() => {
                              element.style.outline = '';
                            }, 1000);
                          }
                        }}
                        className="flex flex-col gap-1"
                      >
                        <Badge className={cn(slotIndexBadgeClasses[index % slotIndexBadgeClasses.length], 'text-white')}>
                          {name}
                        </Badge>
                        {hijackedSlot && <del className="text-xs text-muted-foreground">{originalSlot.name}</del>}
                      </button>
                    </TableCell>
                    <TableCell>{location}</TableCell>
                    {slotCodeExists && <TableCell>{slot ?? ''}</TableCell>}
                    <TableCell>
                      {!data?.adFormat || data?.adFormat === format
                        ? format
                        : (
                            <>
                              <del className="text-red-300 italic">{format}</del>
                              <ins className="no-underline text-green-700">{data?.adFormat}</ins>
                            </>
                          )}
                    </TableCell>
                    {origins.length > 1 && (
                      <TableCell>
                        {data?.origin && <Badge className={cn(slotIndexBadgeClasses[origins.indexOf(data.origin) % slotIndexBadgeClasses.length], 'text-white')}>{data.origin.toLowerCase()}</Badge>}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant="outline" className={cn(status === 'error' ? 'bg-red-500 text-red-50' : '')}>
                        {renderStatusMap[status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {data?.orderId && data?.orderId !== '0'
                        ? (
                            <a
                              href={`https://${adheseContext.options.account}.adhese.org/campaigns.html#campaignDetail/editCampaign/${data.orderId}`}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className={cn(buttonVariants({
                                variant: 'ghost',
                                size: 'sm',
                              }))}
                            >
                              {data.orderId}
                            </a>
                          )
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {data?.adspaceId && data?.adspaceId !== '0'
                        ? (
                            <a
                              href={`https://${adheseContext.options.account}.adhese.org/campaigns.html#campaignDetail/bookingDetail/${data.adspaceId}/${data.orderId}`}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className={cn(buttonVariants({
                                variant: 'ghost',
                                size: 'sm',
                              }))}
                            >
                              {data.adspaceId}
                            </a>
                          )
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {data?.libId && data?.orderId !== '0'
                        ? (
                            <a
                              href={`https://${adheseContext.options.account}.adhese.org/campaigns.html#campaignDetail/creativeDetail/${data.libId}/${data.orderId}`}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className={cn(buttonVariants({
                                variant: 'ghost',
                                size: 'sm',
                              }))}
                            >
                              {data.libId}
                            </a>
                          )
                        : '-'}
                    </TableCell>
                    <TableCell>{data?.id ?? '-'}</TableCell>
                    <TableCell>{data?.ext ? <Badge variant="outline">{data.ext}</Badge> : '-'}</TableCell>
                    <TableCell>
                      {isImpressionTracked
                        ? <Badge className="bg-green-100 text-green-900 hover:bg-green-100">Yes</Badge>
                        : <Badge variant="secondary">No</Badge>}
                    </TableCell>
                    <TableCell>
                      {isViewabilityTracked
                        ? <Badge className="bg-green-100 text-green-900 hover:bg-green-100">Yes</Badge>
                        : <Badge variant="secondary">No</Badge>}
                    </TableCell>
                    {
                      slotParametersExist && (
                        <TableCell>
                          {
                            parameters.length > 0 && (
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
                                      Parameters
                                    </SheetTitle>
                                  </SheetHeader>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Key</TableHead>
                                        <TableHead>Value</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {parameters.map(([parameterName, value]) => (
                                        <TableRow key={parameterName}>
                                          <TableCell>
                                            <Badge variant="outline">{parameterName}</Badge>
                                          </TableCell>
                                          <TableCell>
                                            {
                                              Array.isArray(value)
                                                ? (
                                                    <ul className="flex gap-1">
                                                      {value.map((item, paramIndex) => (
                                                        <li key={paramIndex}>
                                                          <Badge variant="outline">{item}</Badge>
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  )
                                                : <Badge variant="outline">{value}</Badge>
                                            }
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </SheetContent>
                              </Sheet>
                            )
                          }
                        </TableCell>
                      )
                    }
                    {previewExist && (
                      <TableCell>
                        {data?.preview
                        && (
                          <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400">
                            PREVIEW
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="flex gap-1">
                      <EditSlot id={originalSlot.id} />
                      {modifiedSlots.slots.has(originalSlot.name) && (
                        <Button
                          onClick={
                            () => {
                              modifiedSlots.remove(originalSlot.name);
                            }
                          }
                          variant="ghost"
                          size="sm"
                          title="Reset"
                        >
                          <ResetIcon />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>
        )
      : <p>No slots available</p>
  );
}
