import { createResource, ErrorBoundary, For, Show } from 'solid-js';
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
import { Button } from 'solid-headless';
import { RouteDataArgs, useRouteData } from 'solid-start';

interface Props {
  className?: string;
  isOpen: boolean;
  onToggle: () => void;
}

async function fetchData(
  source: unknown,
  {
    value,
    refetching,
  }: {
    value: unknown;
    refetching: boolean | unknown;
  },
) {
  const accountsResponse = await fetch('/api/accounts');
  const accounts = await accountsResponse.json();
  const categoriesResponse = await fetch('/api/budget-categories');
  const categories = await categoriesResponse.json();

  if (!accountsResponse.ok) {
    throw new Error(`An error occurred while fetching accounts. ${accounts?.error}`);
  }
  if (!categoriesResponse.ok) {
    throw new Error(`An error occurred while fetching categories. ${categories?.error}`);
  }

  return { accounts, categories };
}

export function DrawerTransactionForm(props: Props) {
  const [enrolling, { Form }] = createServerAction$(
    async (form: FormData, { request }) => {
      const pb = await initPocketBase(request);
      const userId = pb.authStore.model?.id;

      try {
        const record = await pb.collection('transactions').create({
          description: form.get('description'),
          date: form.get('date'),
          amount: form.get('amount'),
          budget_cat_id_: form.get('budget_cat_id_'),
          account_id: form.get('account_id'),
          user_id: userId,
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
        return json(
          { success: false, error },
          {
            headers: {
              'set-cookie': pb.authStore.exportToCookie(),
            },
          },
        );
      }
    },
    {
      invalidate: 'transactions',
    },
  );

  const [data, { mutate, refetch }] = createResource(fetchData);

  return (
    <Drawer isOpen={props.isOpen} onToggle={props.onToggle} class="w-full max-w-xl">
      <DrawerOverlay />
      <DrawerContent>
        <Show when={!enrolling.result}>
          <DrawerHeader>
            <DrawerTitle>Add transaction</DrawerTitle>
            <DrawerDescription>Fill the form below to add a transaction to your accounts.</DrawerDescription>
          </DrawerHeader>
        </Show>
        <DrawerBody>
          <Show
            when={!enrolling.result}
            fallback={
              // success
              <div class="mt-10 flex flex-col items-center justify-center">
                <div class="flex items-center text-green-500">
                  <AiFillCheckCircle size={40} color="currentColor" />
                </div>
                <p class="text-xl font-semibold text-gray-900">Your transactions was added successfully.</p>

                <p class="text-lg text-gray-900">You can now add more transactions.</p>
                <div class="mt-10">
                  <Button class="w-full rounded bg-black py-4 font-bold text-white  hover:bg-opacity-90">
                    Add more transactions
                  </Button>
                </div>
                <div class="mt-4">
                  <Button
                    onClick={() => {
                      props.onToggle();
                    }}
                    class="w-full rounded border-2 border-black bg-white py-4 font-bold text-black  hover:bg-opacity-90"
                  >
                    Go to my transactions
                  </Button>
                </div>
              </div>
            }
          >
            <Form class={'mt-10'} id="account-form">
              <div class="mb-6 w-full">
                <input
                  type="text"
                  name="description"
                  id="description"
                  class="w-full rounded bg-slate-100 py-4 px-8 outline-blue-500 placeholder:font-semibold hover:ring-1
         focus:bg-slate-200 
          "
                  placeholder="Description (optional)"
                />
              </div>
              <div class="mb-6 w-full">
                <input
                  type="date"
                  name="date"
                  id="date"
                  class="w-full appearance-none rounded bg-slate-100 py-4 px-8 outline-blue-500 placeholder:font-semibold hover:ring-1"
                  placeholder="Date"
                  required
                />
              </div>
              <div class="mb-6 w-full">
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  class="w-full appearance-none rounded bg-slate-100 py-4 px-8 outline-blue-500 placeholder:font-semibold hover:ring-1"
                  placeholder="Amount"
                  required
                />
              </div>
              <fieldset class="mb-6 w-full">
                <label
                  for="
                budget_cat_id
                "
                  class=""
                >
                  Budget category
                </label>
                <select
                  id="budget_cat_id_"
                  name="budget_cat_id_"
                  required
                  class="text-md mt-2 block  w-full appearance-none rounded-lg border border-gray-300 bg-slate-100 p-2.5 py-4 text-gray-900 focus:border-blue-500 focus:bg-slate-200 focus:ring-blue-500 "
                >
                  <option value={''} selected>
                    Choose an option
                  </option>

                  <For each={data()?.categories.data}>
                    {(account) => <option value={account.id}>{account.name}</option>}
                  </For>
                </select>
              </fieldset>

              <Show when={data.state === 'ready'}>
                <fieldset class="mb-6 w-full">
                  <label for="account_id" class="">
                    Account
                  </label>
                  <select
                    id="account_id"
                    name="account_id"
                    required
                    class="text-md mt-2 block  w-full appearance-none rounded-lg border border-gray-300 bg-slate-100 p-2.5 py-4 text-gray-900 focus:border-blue-500 focus:bg-slate-200 focus:ring-blue-500 "
                  >
                    <option value={''} selected>
                      Choose an account
                    </option>
                    <For each={data()?.accounts.data}>
                      {(account) => <option value={account.id}>{account.name}</option>}
                    </For>
                  </select>
                </fieldset>
              </Show>
              <div class="mb-6 w-full"></div>
            </Form>
          </Show>
          {/* </ErrorBoundary> */}
        </DrawerBody>

        <Show when={!enrolling.result}>
          <DrawerFooter>
            <div class="flex justify-end gap-2">
              <button class="w-full rounded border-2 border-black bg-white py-4 font-bold text-black  hover:bg-opacity-90">
                Cancelar
              </button>
              <button
                form="account-form"
                type="submit"
                class="w-full rounded bg-black py-4 font-bold text-white  hover:bg-opacity-90"
                disabled={enrolling.pending}
              >
                Agregar
              </button>
            </div>
          </DrawerFooter>
        </Show>
      </DrawerContent>
    </Drawer>
  );
}
