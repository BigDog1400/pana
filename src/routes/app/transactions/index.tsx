import { Button } from 'solid-headless';
import { RiSystemAddFill } from 'solid-icons/ri';
import { createSignal, For, Show } from 'solid-js';
import { ErrorBoundary, RouteDataArgs, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { DrawerTransactionForm } from '~/components/drawer-transaction-form';
import NavBar from '~/components/nav-bar';
import { initPocketBase } from '~/db';

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(
    async (undefined, { request }) => {
      const pb = await initPocketBase(request);
      const resultList = await pb.collection('transactions').getList<{
        account_id: string;
        amount: number;
        budget_cat_id_: string;
        collectionId: string;
        collectionName: string;
        created: string;
        date: string;
        description: string;
        id: string;
        updated: string;
        user_id: string;
        expand: {
          account_id: {
            account_type_id: string;
            collectionId: string;
            collectionName: string;
            created: string;
            current_balance: number;
            id: string;
            name: string;
            updated: string;
            user_id: string;
            expand: {};
          };
          budget_cat_id_: {
            collectionId: string;
            collectionName: string;
            created: string;
            group_id: string;
            id: string;
            name: string;
            updated: string;
            expand: {};
          };
        };
      }>(1, 50, {
        expand: 'budget_cat_id_,account_id',
      });

      return resultList;
    },
    {
      key: 'transactions',
    },
  );
}

export default function Transactions() {
  const [isOpen, setIsOpen] = createSignal(false);
  const transactions = useRouteData<typeof routeData>();
  return (
    <>
      <NavBar
        rightElement={
          // add wallet button

          <button
            class="inline-flex  h-10 items-center gap-2 rounded-[3px] border-2
            border-black
            bg-white
            px-5 py-1
            text-sm
            font-semibold
            text-black
            hover:bg-gray-100
            "
            onClick={() => setIsOpen(true)}
          >
            <RiSystemAddFill />
            Add transaction
          </button>
        }
      />
      <div class="mb-20">
        <Show when={transactions()?.totalItems === 0}>
          <p class="text-gray-500">No accounts found</p>
        </Show>
        <Show when={transactions()?.totalItems !== 0}>
          <div class="relative overflow-x-auto">
            <table class="table-wrapper w-full text-left text-sm text-gray-500 ">
              <thead class="border-b text-xs uppercase">
                <tr>
                  <th scope="col" class="p-4">
                    <div class="flex items-center">
                      <input
                        id="checkbox-all-search"
                        type="checkbox"
                        class="h-5 w-5 cursor-pointer border-gray-300 bg-gray-100"
                      />
                      <label for="checkbox-all-search" class="sr-only">
                        checkbox
                      </label>
                    </div>
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Description
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Date
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Amount
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Budget Category
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Account
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <For each={transactions()?.items}>
                  {(item) => (
                    <tr class="border-b hover:bg-gray-100 ">
                      <td class="w-4 p-4">
                        <div class="flex items-center">
                          <input id="checkbox-table-search-3" type="checkbox" class="h-5 w-5 cursor-pointer" />
                          <label for="checkbox-table-search-3" class="sr-only">
                            checkbox
                          </label>
                        </div>
                      </td>
                      <th scope="row" class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 ">
                        {item.description}
                      </th>
                      <th scope="row" class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 ">
                        {item.date}
                      </th>
                      <th scope="row" class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 ">
                        {item.amount}
                      </th>
                      <th scope="row" class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 ">
                        {item.expand.budget_cat_id_.name}
                      </th>
                      <th scope="row" class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 ">
                        {item.expand.account_id.name}
                      </th>

                      <td class="flex items-center space-x-3 px-6 py-4">
                        <a href="#" class="font-medium text-blue-600 hover:underline dark:text-blue-500">
                          Edit
                        </a>
                        <a href="#" class="font-medium text-red-600 hover:underline dark:text-red-500">
                          Remove
                        </a>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </div>
      <Show when={isOpen()}>
        <ErrorBoundary
          fallback={(err, reset) => {
            return (
              <div class="mt-10 flex flex-col items-center justify-center">
                <p class="text-xl font-semibold text-red-500">{err.message}</p>
                <div class="mt-10">
                  <Button
                    onClick={reset}
                    class="w-full rounded bg-black py-4 px-5 font-bold text-white hover:bg-opacity-90"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            );
          }}
        >
          <DrawerTransactionForm className="mt-10" isOpen={isOpen()} onToggle={() => setIsOpen(false)} />
        </ErrorBoundary>
      </Show>
    </>
  );
}
