import { createEffect, createResource, createSignal, ErrorBoundary, For, Show } from 'solid-js';
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
import { RouteDataArgs, useRouteData } from 'solid-start';
import { Input, Select } from '~/modules/ui/components/form';
import { Button } from '~/modules/ui/components/button';
import { ClientResponseError } from 'pocketbase';
interface Props {
  className?: string;
  isOpen: boolean;
  onToggle: () => void;

  initialValues: {
    amount: number;
    id: string;
  };
}

export function DrawerUpdateTargetBudgetForm(props: Props) {
  const [enrolling, { Form }] = createServerAction$(async (form: FormData, { request }) => {
    const pb = await initPocketBase(request);
    const userId = pb.authStore.model?.id;

    try {
      const record = await pb.collection('budget_targets').update(form.get('id') as string, {
        budgeted_amount: form.get('budgeted_amount'),
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
          data: {
            code: number;
            message: string;
            data: Record<string, string>;
          };
        };
      } = await enrolling.result?.json();
      if (result?.error?.data) setError(result?.error?.data);
    }
  });

  return (
    <Drawer isOpen={props.isOpen} onToggle={props.onToggle} class="w-full max-w-xl">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Update budget target</DrawerTitle>
          <DrawerDescription>Fill the form below to update your budget target.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <Show
            when={!result()}
            fallback={
              <div class="mt-10 flex flex-col items-center justify-center rounded-md border-2 border-black p-6">
                <div class="flex items-center text-green-500">
                  <AiFillCheckCircle size={40} color="currentColor" />
                </div>
                <p class="text-xl font-semibold text-gray-900">Budget target updated</p>

                <p class="mt-5 text-center text-lg text-gray-900">
                  Your budget target has been updated successfully. You can close this form now.
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
                  step={0.01}
                  required
                  value={props.initialValues.amount}
                />
              </fieldset>
              <input type="hidden" name="id" value={props.initialValues.id} />
            </Form>
          </Show>

          <Show when={error() && !result()}>
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
