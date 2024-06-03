import { type PropsWithChildren, type ReactElement, useEffect, useMemo, useState } from 'react';
import { pick, watch } from '@adhese/sdk-shared';
import type { AdheseSlot } from '@adhese/sdk';
import { type TypeOf, object, string } from '@adhese/sdk-shared/validators';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil1Icon } from '@radix-ui/react-icons';
import { useAdheseContext } from '../AdheseContext';
import { useModifiedSlots } from '../modifiedSlots.store';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input } from './input';
import { Button, buttonVariants } from './button';

const slotSchema = object({
  format: string().min(1),
  slot: string().optional(),
});

type SlotSchema = TypeOf<typeof slotSchema>;

// eslint-disable-next-line ts/naming-convention
export function EditSlot({
  id,
}: {
  id: string;
}): ReactElement {
  const slot = useSlot(id);

  return (
    <Sheet>
      <SheetTrigger
        aria-label="Edit slot"
        className={buttonVariants({
          variant: 'ghost',
          size: 'sm',
        })}
      >
        <Pencil1Icon />
      </SheetTrigger>
      <SheetContent>
        {slot && <EditSlotForm slot={slot} />}
      </SheetContent>
    </Sheet>
  );
}

// eslint-disable-next-line ts/naming-convention
function EditSlotForm({
  slot,
}: {
  slot: AdheseSlot;
}): ReactElement {
  const modifiedSlots = useModifiedSlots();
  const modifiedSlot = useMemo(() => modifiedSlots.slots.get(slot?.name ?? ''), [modifiedSlots, slot]);

  const defaultValues = useMemo(() => pick(modifiedSlot ?? {
    format: slot.format,
    slot: slot.slot ?? '',
  }, ['format', 'slot']), [slot, modifiedSlot]);

  const form = useForm<SlotSchema>({
    resolver: zodResolver(slotSchema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<SlotSchema> = (data) => {
    modifiedSlots.set(slot.name, pick({
      ...slot,
      ...data,
    }, ['format', 'slot']));
  };

  return (
    <>
      <SheetHeader className="mb-8">
        <SheetTitle>
          Edit slot
        </SheetTitle>
        <SheetDescription>
          {slot.name}
        </SheetDescription>
      </SheetHeader>

      <Form {...form}>
        {/* eslint-disable-next-line ts/no-misused-promises */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="format"
            render={({ field }) => (
              <SlotFormItem label="Format">
                <Input {...field} />
              </SlotFormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slot"
            render={({ field }) => (
              <SlotFormItem label="Slot">
                <Input {...field} />
              </SlotFormItem>
            )}
          />

          <Button className="w-full mt-10">
            Edit
          </Button>
        </form>
      </Form>
    </>
  );
}

// eslint-disable-next-line ts/naming-convention
function SlotFormItem({
  label,
  description,
  children,
}: PropsWithChildren<{
  label: string;
  description?: string;
}>): ReactElement {
  return (
    <FormItem className="mb-3">
      <FormLabel>{label}</FormLabel>
      {description && <FormDescription>{description}</FormDescription>}
      <FormControl>
        {children}
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

function useSlot(id: string): AdheseSlot | undefined {
  const adheseContext = useAdheseContext();
  const [slot, setSlot] = useState(adheseContext?.slots.get(id));

  useEffect(() => {
    if (!adheseContext) {
      return;
    }

    return watch(() => adheseContext.slots, (slots) => {
      setSlot(slots.get(id));
    }, { immediate: true, deep: true });
  }, [adheseContext, id]);
  return slot;
}
