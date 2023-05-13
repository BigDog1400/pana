import { createEffect, createSignal, Show } from 'solid-js';
import { createServerAction$, json } from 'solid-start/server';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle,
} from '~/components/drawer';
import { initPocketBase } from '~/db';
import { AiFillCheckCircle } from 'solid-icons/ai';
import { Input } from '~/modules/ui/components/form';
import { Button } from '~/modules/ui/components/button';
import { ClientResponseError } from 'pocketbase';
interface Props {
  className?: string;
  isOpen: boolean;
  onToggle: () => void;
  budgetCategory: {
    group_id: string;
    id: string;
    name: string;
  };
  date: Date;
}

export function DrawerBudgetTargetForm(props: Props) {
  const [enrolling, { Form }] = createServerAction$(async (form: FormData, { request }) => {
    const pb = await initPocketBase(request);
    const userId = pb.authStore.model?.id;
    // Parse the date from the form tu UTC

    try {
      const record = await pb.collection('budget_targets').create({
        budget_cat_id: form.get('budget_cat_id'),
        budgeted_amount: form.get('budgeted_amount'),
        user_id: userId,
        date: form.get('date'),
      });

      return json(
        { success: true, data: record },
        {
          headers: {
            'set-cookie': pb.authStore.exportToCookie(),
          },
        },
      );
    } catch (error) {
      if (error instanceof ClientResponseError) {
        return json(
          { success: false, error },
          {
            status: error.status,
            headers: {
              'set-cookie': pb.authStore.exportToCookie(),
            },
          },
        );
      }
    }
  });
  const [result, setResult] = createSignal();
  const [error, setError] = createSignal<{
    code: number;
    message: string;
    data: Record<string, string>;
  }>();

  createEffect(async () => {
    if (enrolling.result?.ok) {
      let data = await enrolling.result.json();
      setResult(data);
    } else if (!enrolling.result?.ok) {
      let result: {
        success: boolean;
        error: {
          code: number;
          message: string;
          data: Record<string, string>;
        };
      } = await enrolling.result?.json();

      setError(result.error);
    }
  });

  return (
    <Drawer isOpen={props.isOpen} onToggle={props.onToggle} class="w-full max-w-xl">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add budget target</DrawerTitle>
          <DrawerDescription>Fill the form below to add a new budget target.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <Show
            when={!result()}
            fallback={
              <div class="mt-10 flex flex-col items-center justify-center rounded-md border-2 border-black p-6">
                <div class="flex items-center text-green-500">
                  <AiFillCheckCircle size={40} color="currentColor" />
                </div>
                <p class="text-xl font-semibold text-gray-900">Budget target added.</p>

                <p class="mt-5 text-center text-lg text-gray-900">
                  Your budget target has been added successfully. You can close this form now.
                </p>
                <div class="mt-6">
                  <Button
                    fw={'semibold'}
                    width="full"
                    variant={'primary'}
                    onClick={() => {
                      setResult(undefined);
                      setError(undefined);
                      enrolling.clear();
                      props.onToggle();
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            }
          >
            <Form class={'mt-6 grid gap-5'} id="account-form">
              <fieldset class="w-full">
                <label for="budgeted_amount" class="mb-2 block text-sm font-semibold text-gray-900">
                  Budget target
                </label>
                <Input
                  type="number"
                  name="budgeted_amount"
                  id="budgeted_amount"
                  placeholder="Amount"
                  required
                  step={0.01}
                />
              </fieldset>
              <input type="hidden" name="budget_cat_id" value={props.budgetCategory.id} />
              <input type="hidden" name="date" value={props.date.toISOString()} />
            </Form>
          </Show>

          <Show when={error()}>
            <div
              class="mt-4 rounded-md border border-red-300
            bg-red-100 p-4 text-sm font-semibold text-red-500"
            >
              {error()?.message || 'An error occurred while adding your budget target.'}
            </div>
          </Show>
          <Show when={enrolling.error}>
            <div
              class="mt-4 rounded-md border border-red-300
            bg-red-100 p-4 text-sm font-semibold text-red-500"
            >
              {enrolling.error?.message || 'An error happened while adding your budget target.'}
            </div>
          </Show>
        </DrawerBody>

        <Show when={result() === undefined}>
          <DrawerFooter>
            <div class="flex justify-end gap-2">
              <Button fw={'semibold'} variant={'secondary'} onClick={props.onToggle}>
                Cancelar
              </Button>
              <Button fw={'semibold'} form="account-form" type="submit" disabled={enrolling.pending}>
                Agregar
              </Button>
            </div>
          </DrawerFooter>
        </Show>
      </DrawerContent>
    </Drawer>
  );
}
