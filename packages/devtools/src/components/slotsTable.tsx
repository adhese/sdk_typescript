import { type ReactElement, useEffect, useMemo, useState } from 'react';
import type { AdheseContext, Slot } from '@core';
import { cn } from '../utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Badge } from './badge';
import { Button, buttonVariants } from './button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './sheet';

const slotStatus = {
  unloaded: 'Waiting to load',
  loaded: 'Ready to render',
  rendered: 'Rendered',
} as const;

// eslint-disable-next-line ts/naming-convention
export function SlotsTable({ adheseContext }: {
  adheseContext: AdheseContext;
}): ReactElement {
  const [slots, setSlots] = useState<ReadonlyArray<Slot>>([]);

  useEffect(() => {
    function onSlotsChange(newSlots: ReadonlyArray<Slot>): void {
      setSlots(newSlots);
    }

    adheseContext.events?.changeSlots.addListener(onSlotsChange);

    setSlots(adheseContext.getAll?.() ?? []); // This line is added to set the initial slots

    return (): void => {
      adheseContext.events?.changeSlots.removeListener(onSlotsChange);
    };
  }, []);

  const formattedSlots = useMemo(() => slots.map((slot) => {
    const ad = slot.getAd();
    const iframe = slot.getElement();

    let status: keyof typeof slotStatus = 'unloaded';

    if (iframe)
      status = 'rendered';
    else if (ad)
      status = 'loaded';

    return ({
      ...slot,
      name: slot.getName(),
      ad,
      status,
      iframe,
      parameters: Array.from(slot.parameters.entries()),
    });
  }), [slots]);

  return (
    formattedSlots.length > 0
      ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Render Status</TableHead>
              <TableHead>Campaign ID</TableHead>
              <TableHead>Booking ID</TableHead>
              <TableHead>Creative ID</TableHead>
              <TableHead>Traffic ID</TableHead>
              <TableHead>Creative type</TableHead>
              <TableHead>Viewability tracked</TableHead>
              <TableHead>Impression tracked</TableHead>
              <TableHead>Element</TableHead>
              {
                formattedSlots.some(({ parameters }) => parameters.length > 0)
                  ? <TableHead>Parameters</TableHead>
                  : null
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
            }) => (
              <TableRow key={name}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell>{format}</TableCell>
                <TableCell>{location}</TableCell>
                <TableCell>
                  <Badge className={cn('', {
                    unloaded: 'bg-secondary text-secondary-foreground hover:bg-secondary',
                    loaded: 'bg-blue-100 text-blue-900 hover:bg-blue-100',
                    rendered: 'bg-green-100 text-green-900 hover:bg-green-100',
                  }[status])}
                  >
                    {slotStatus[status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ad?.orderId
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
                  {ad?.adspaceId
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
                  {ad?.libId
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
                <TableCell>{isViewabilityTracked() ? <Badge className="bg-green-100 text-green-900 hover:bg-green-100">Yes</Badge> : <Badge variant="secondary">No</Badge>}</TableCell>
                <TableCell>{isImpressionTracked() ? <Badge className="bg-green-100 text-green-900 hover:bg-green-100">Yes</Badge> : <Badge variant="secondary">No</Badge>}</TableCell>
                <TableCell>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!iframe}
                    onClick={() => {
                      if (iframe) {
                        iframe.scrollIntoView();
                        iframe.style.outline = 'solid 5px red';

                        setTimeout(() => {
                          iframe.style.outline = '';
                        }, 1000);
                      }
                    }}
                  >
                    Go to element
                  </Button>
                </TableCell>
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
                              {parameters.map(([key, value]) => (
                                <TableRow key={key}>
                                  <TableCell>
                                    <Badge variant="outline">{key}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    {
                                    Array.isArray(value)
                                      ? (
                                        <ul className="flex gap-1">
                                          {value.map((item, index) => (
                                            <li key={index}>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )
      : <p>No slots available</p>
  );
}
