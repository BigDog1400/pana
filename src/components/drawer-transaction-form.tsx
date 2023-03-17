import { createResource, createSignal, ErrorBoundary, For, Show, Suspense } from 'solid-js';
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
  const budget_categories = await categoriesResponse.json();
  const incomeCategoriesResponse = await fetch('/api/income-categories');
  const income_categories = await incomeCategoriesResponse.json();

  if (!incomeCategoriesResponse.ok) {
    console.log('Error fetching income categories', income_categories);
    throw new Error(`An error occurred while fetching income categories. ${income_categories?.error}`);
  }
  if (!accountsResponse.ok) {
    console.log('Error fetching income categories', accounts);

    throw new Error(`An error occurred while fetching accounts. ${accounts?.error}`);
  }
  if (!categoriesResponse.ok) {
    console.log('Error fetching income categories', budget_categories);
    throw new Error(`An error occurred while fetching categories. ${budget_categories?.error}`);
  }

  return { accounts, budget_categories, income_categories };
}

export function DrawerTransactionForm(props: Props) {
  const [enrolling, { Form }] = createServerAction$(
    async (form: FormData, { request }) => {
      const pb = await initPocketBase(request);
      const userId = pb.authStore.model?.id;
      debugger;

      try {
        const record = await pb.collection('transactions').create({
          description: form.get('description'),
          date: form.get('date'),
          // The amount should be negative if it's an expense
          amount:
            form.get('transaction_type') === 'expense'
              ? -Math.abs(Number(form.get('amount')))
              : Number(form.get('amount')),
          budget_cat_id_: form.get('budget_cat_id_'),
          account_id: form.get('account_id'),
          user_id: userId,
          transaction_type: form.get('transaction_type'),
          income_category_id: form.get('income_category_id'),
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
  const [transaction, setTransaction] = createSignal<'expense' | 'income'>('expense');
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
            <Form class={'mt-6 grid gap-5'} id="account-form">
              <div class="mb-6 w-full">
                <fieldset
                  class={`flex w-full flex-row items-center justify-center gap-x-1`}
                  onchange={(e) => {
                    if ('checked' in e.target && 'value' in e.target) {
                      setTransaction(e.target.value as 'expense' | 'income');
                    }
                  }}
                >
                  <div class="flex w-full">
                    <input
                      type="radio"
                      name="transaction_type"
                      value="expense"
                      id="expense"
                      class="peer hidden"
                      checked
                    />
                    <label
                      class="w-full cursor-pointer rounded-md bg-white p-2 text-center text-xl font-bold text-black hover:bg-[#f5f5f5] peer-checked:shadow-[0_0_0_2px_black]"
                      for="expense"
                    >
                      Expense
                    </label>
                  </div>
                  <div class="flex w-full">
                    <input type="radio" id="income" name="transaction_type" class="peer hidden" value="income" />
                    <label
                      class="w-full cursor-pointer rounded-md bg-white p-2  text-center text-xl font-bold text-black hover:bg-[#f5f5f5] peer-checked:shadow-[0_0_0_2px_black]"
                      for="income"
                    >
                      Income
                    </label>
                  </div>
                </fieldset>
              </div>
              <fieldset class="w-full">
                <label for="description" class="mb-2 block text-sm font-semibold text-gray-900">
                  Description
                </label>

                <Input type="text" name="description" id="description" placeholder="Description (optional)" />
              </fieldset>
              <fieldset class="w-full">
                <label for="date" class="mb-2 block text-sm font-semibold text-gray-900">
                  Date
                </label>
                <Input type="date" name="date" id="date" placeholder="Date" required />
              </fieldset>
              <fieldset class="w-full">
                <label for="amount" class="mb-2 block text-sm font-semibold text-gray-900">
                  Amount
                </label>
                <Input type="number" name="amount" id="amount" placeholder="Amount" required />
              </fieldset>
              <Show when={data.state === 'ready'}>
                <Show when={transaction() === 'expense'}>
                  <fieldset class="w-full">
                    <label
                      for="
                budget_cat_id
                "
                      class="mb-2 block text-sm font-semibold text-gray-900"
                    >
                      Budget category
                    </label>
                    <Select id="budget_cat_id_" name="budget_cat_id_" required class="mt-1">
                      <option value={''} selected>
                        Choose an option
                      </option>

                      <For each={data()?.budget_categories.data}>
                        {(account) => <option value={account.id}>{account.name}</option>}
                      </For>
                    </Select>
                  </fieldset>
                </Show>
                <Show when={transaction() === 'income'}>
                  <fieldset class="w-full">
                    <label
                      for="
                income_cat_id
                "
                      class="mb-2 block text-sm font-semibold text-gray-900"
                    >
                      Income category
                    </label>
                    <Select id="income_category_id" name="income_category_id" required class="mt-1">
                      <option value={''} selected>
                        Choose an option
                      </option>

                      <For each={data()?.income_categories.data}>
                        {(income_cat) => <option value={income_cat.id}>{income_cat.name}</option>}
                      </For>
                    </Select>
                  </fieldset>
                </Show>

                <fieldset class="w-full">
                  <label for="account_id" class="mb-2 block text-sm font-semibold text-gray-900">
                    Account
                  </label>
                  <Select id="account_id" name="account_id" required class="mt-1">
                    <option value={''} selected>
                      Choose an account
                    </option>
                    <For each={data()?.accounts.data}>
                      {(account) => <option value={account.id}>{account.name}</option>}
                    </For>
                  </Select>
                </fieldset>
              </Show>
            </Form>
          </Show>
          {/* </ErrorBoundary> */}
        </DrawerBody>

        <Show when={!enrolling.result}>
          <DrawerFooter>
            <div class="flex justify-end gap-2">
              <Button
                fw={'semibold'}
                variant={'secondary'}
                disabled
                onClick={() => {
                  props.onToggle();
                }}
              >
                Cancelar
              </Button>
              <Button
                fw={'semibold'}
                form="account-form"
                type="submit"
                // class="w-full rounded bg-black py-4 font-bold text-white  hover:bg-opacity-90"
                // disabled={true}
                // disabled={enrolling.pending}
              >
                Agregar
              </Button>
            </div>
          </DrawerFooter>
        </Show>
      </DrawerContent>
    </Drawer>
  );
}
