import { type PropsWithChildren, type ReactElement, useEffect, useState } from 'react';
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

  const adheseContext = useAdheseContext();

  const form = useForm<SlotSchema>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      format: slot?.format ?? '',
      slot: slot?.slot ?? '',
    },
  });

  const modifiedSlots = useModifiedSlots();

  const onSubmit: SubmitHandler<SlotSchema> = (data) => {
    if (slot) {
      if (!adheseContext?.slots.has(slot.name)) {
        modifiedSlots.set({
          old: pick(slot.options, ['format', 'slot']),
          new: pick({
            ...slot.options,
            ...data,
          }, ['format', 'slot']),
        }, slot.name);
      }
    }
  };

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
        {slot && (
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
                <p className="mt-3 text-sm text-muted-foreground">Refresh the page to see your changes</p>
              </form>
            </Form>
          </>
        )}
      </SheetContent>
    </Sheet>
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
