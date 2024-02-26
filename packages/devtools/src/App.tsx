import type { AdheseContext, Slot } from '@core';
import { type ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import './globals.css';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/table';
import { Badge } from './components/badge';
import { cn } from './utils';
import { buttonVariants } from './components/button';

const slotStatus = {
  unloaded: 'Waiting to load',
  loaded: 'Ready to render',
  rendered: 'Rendered',
} as const;
// eslint-disable-next-line ts/naming-convention
export function App({ adheseContext }: {
  adheseContext: AdheseContext;
}): ReactElement {
  const [slots, setSlots] = useState<ReadonlyArray<Slot>>([]);

  useEffect(() => {
    function onSlotsChange(newSlots: ReadonlyArray<Slot>): void {
      setSlots(newSlots);
    }

    adheseContext.events?.changeSlots.addListener(onSlotsChange);

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
    });
  }), [slots]);

  const [spacing, setSpacing] = useState(0);
  const appRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      setSpacing(entry.target.getBoundingClientRect().height);
    },
    );

    if (appRef.current)
      resizeObserver.observe(appRef.current);

    return (): void => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div className="fixed bottom-0 w-full border-t-2 border-t-accent p-4 bg-background shadow-lg overflow-auto" ref={appRef}>
        {
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formattedSlots.map(({ ad, name, format, location, status }) => (
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
                                variant: 'outline',
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
                                variant: 'outline',
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
                                variant: 'outline',
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )
            : 'No slots available'
        }
      </div>
      <div style={{
        height: spacing,
      }}
      />
    </>
  );
}
