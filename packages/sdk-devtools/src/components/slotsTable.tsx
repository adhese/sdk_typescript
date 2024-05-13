import { Fragment, type ReactElement, useEffect, useMemo, useState } from 'react';
import { type AdheseContext, type AdheseSlot, type UnwrapRef, watch } from '@adhese/sdk';
import { createPortal } from 'react-dom';
import { cn } from '../utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Badge } from './badge';
import { buttonVariants } from './button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './sheet';

const slotIndexBadgeClasses = [
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
export function SlotsTable({ adheseContext }: {
  adheseContext: AdheseContext;
}): ReactElement {
  const [slots, setSlots] = useState<ReadonlyArray<AdheseSlot>>([]);

  useEffect(() => {
    const disposeWatcher = watch(() => adheseContext.slots, (newSlots) => {
      setSlots(Array.from(newSlots.values()));
    }, { immediate: true, deep: true });

    return (): void => {
      disposeWatcher();
    };
  }, [adheseContext]);

  const formattedSlots = useMemo(() => slots.map((slot) => {
    const iframe = slot.element;

    return ({
      ...slot,
      iframe,
      parameters: Array.from(slot.parameters.entries()),
    });
  }), [slots]);

  const slotParametersExist = formattedSlots.some(formattedSlot => formattedSlot.parameters.length > 0);
  const previewExist = formattedSlots.some(formattedSlot => formattedSlot.ad?.preview);
  const slotCodeExists = formattedSlots.some(formattedSlot => formattedSlot.slot);

  const origins: ReadonlyArray<string> = useMemo(() => {
    const set = new Set<string>();

    for (const slot of formattedSlots) {
      const { ad } = slot;

      if (ad)
        set.add(ad.origin);
    }

    return Array.from(set);
  }, [formattedSlots]);

  return (
    formattedSlots.length > 0
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {formattedSlots.map(({
              ad,
              name,
              format,
              location,
              status,
              isViewabilityTracked,
              isImpressionTracked,
              iframe,
              parameters,
              slot,
            }, index) => (
              <Fragment key={name}>
                <TableRow id={name}>
                  <TableCell className="font-medium">
                    <button onClick={() => {
                      if (iframe) {
                        iframe.scrollIntoView();
                        iframe.style.outline = 'solid 5px red';

                        setTimeout(() => {
                          iframe.style.outline = '';
                        }, 1000);
                      }
                    }}
                    >
                      <Badge className={cn(slotIndexBadgeClasses[index % slotIndexBadgeClasses.length], 'text-white')}>{name}</Badge>
                    </button>
                  </TableCell>
                  <TableCell>{location}</TableCell>
                  {slotCodeExists && <TableCell>{slot ?? ''}</TableCell>}
                  <TableCell>
                    {!ad?.adFormat || ad?.adFormat === format
                      ? format
                      : (
                        <>
                          <del className="text-red-300 italic">{format}</del>
                          <ins className="no-underline text-green-700">{ad?.adFormat}</ins>
                        </>
                        )}
                  </TableCell>
                  {origins.length > 1 && (
                    <TableCell>
                      {ad?.origin && <Badge className={cn(slotIndexBadgeClasses[origins.indexOf(ad.origin) % slotIndexBadgeClasses.length], 'text-white')}>{ad.origin.toLowerCase()}</Badge>}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant="outline" className={cn(status === 'error' ? 'bg-red-500 text-red-50' : '')}>
                      {renderStatusMap[status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ad?.orderId && ad?.orderId !== '0'
                      ? (
                        <a
                          href={`https://${adheseContext.options.account}.adhese.org/campaigns.html#campaignDetail/editCampaign/${ad.orderId}`}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className={cn(buttonVariants({
                            variant: 'ghost',
                            size: 'sm',
                          }))}
                        >
                          {ad.orderId}
                        </a>
                        )
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {ad?.adspaceId && ad?.adspaceId !== '0'
                      ? (
                        <a
                          href={`https://${adheseContext.options.account}.adhese.org/campaigns.html#campaignDetail/bookingDetail/${ad.adspaceId}/${ad.orderId}`}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className={cn(buttonVariants({
                            variant: 'ghost',
                            size: 'sm',
                          }))}
                        >
                          {ad.adspaceId}
                        </a>
                        )
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {ad?.libId && ad?.orderId !== '0'
                      ? (
                        <a
                          href={`https://${adheseContext.options.account}.adhese.org/campaigns.html#campaignDetail/creativeDetail/${ad.libId}/${ad.orderId}`}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className={cn(buttonVariants({
                            variant: 'ghost',
                            size: 'sm',
                          }))}
                        >
                          {ad.libId}
                        </a>
                        )
                      : '-'}
                  </TableCell>
                  <TableCell>{ad?.id ?? '-'}</TableCell>
                  <TableCell>{ad?.ext ? <Badge variant="outline">{ad.ext}</Badge> : '-'}</TableCell>
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
                      {ad?.preview
                      && (
                        <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400">
                          PREVIEW
                        </Badge>
                      )}
                    </TableCell>
                  )}
                </TableRow>
                {iframe?.parentElement && createPortal(
                  <div className="absolute inset-1 flex gap-2 items-start">
                    <Badge className={cn(slotIndexBadgeClasses[index % slotIndexBadgeClasses.length], 'text-white')}>
                      {name}
                    </Badge>
                    {
                      ad?.preview && <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400">PREVIEW</Badge>
                    }
                  </div>,
                  iframe.parentElement,
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
        )
      : <p>No slots available</p>
  );
}
