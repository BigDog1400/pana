import { createEffect, createResource, createSignal, ErrorBoundary, For, Show } from 'solid-js';
import { createServerAction$, createServerData$, json } from 'solid-start/server';
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
  budgetGroup: {
    id: string;
  };
}

export function DrawerBudgetCategoryTargetForm(props: Props) {
  const [enrolling, { Form }] = createServerAction$(async (form: FormData, { request }) => {
    const pb = await initPocketBase(request);

    try {
      const record = await pb.collection('budget_categories').create({
        group_id: form.get('group_id'),
        name: form.get('name'),
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
          <DrawerTitle>Add budget category</DrawerTitle>
          <DrawerDescription>Fill the form below to add a new budget category.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <Show
            when={!result()}
            fallback={
              <div class="mt-10 flex flex-col items-center justify-center rounded-md border-2 border-black p-6">
                <div class="flex items-center text-green-500">
                  <AiFillCheckCircle size={40} color="currentColor" />
                </div>
                <p class="text-xl font-semibold text-gray-900">Budget category added</p>

                <p class="mt-5 text-center text-lg text-gray-900">
                  Your budget category has been added successfully. You can close this form now.
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
                <label for="name" class="mb-2 block text-sm font-semibold text-gray-900">
                  Category name
                </label>
                <Input type="text" name="name" id="name" placeholder="Name" required />
              </fieldset>
              <input type="hidden" name="group_id" value={props.budgetGroup.id} />
            </Form>
          </Show>

          <Show when={error()}>
            <div
              class="mt-4 rounded-md border border-red-300
            bg-red-100 p-4 text-sm font-semibold text-red-500"
            >
              {error()?.message || 'An error occurred while adding your budget category.'}
            </div>
          </Show>
          <Show when={enrolling.error}>
            <div
              class="mt-4 rounded-md border border-red-300
            bg-red-100 p-4 text-sm font-semibold text-red-500"
            >
              {enrolling.error?.message || 'An error happened while adding your budget category.'}
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
