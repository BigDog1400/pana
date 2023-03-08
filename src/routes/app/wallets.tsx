import NavBar from '~/components/nav-bar';
import { RiSystemAddFill } from 'solid-icons/ri';
import { createSignal, For, Show } from 'solid-js';
import { DrawerAccountForm } from '~/components/drawer-account-form';
import { createServerData$ } from 'solid-start/server';
import { RouteDataArgs, useRouteData } from 'solid-start';
import { initPocketBase } from '~/db';
import { ListResult } from 'pocketbase';

interface Account {
  account_type_id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  field: string;
  id: string;
  name: string;
  updated: string;
  user_id: string;
  expand: {
    collectionId: string;
    collectionName: string;
    created: string;
    id: string;
    name: string;
    updated: string;
    expand: any;
  };
}

interface AccountWithCurrentBalance extends Account {
  current_balance: number;
}

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(
    async (_, { request }) => {
      const pb = await initPocketBase(request);
      const accountList = await pb.collection('accounts').getList<Account>(1, 50, {
        expand: 'account_type_id',
      });

      await Promise.all(
        accountList.items.map(async (item) => {
          const transactionList = await pb.collection('transactions').getFullList<{
            account_id: string;
            amount: number;
            budget_cat_id: string;
            collectionId: string;
            collectionName: string;
            created: string;
            date: string;
            id: string;
            updated: string;
            user_id_: string;
          }>(undefined, {
            $autoCancel: false,
            filter: `account_id = "${item.id}"`,
          });
          const total = transactionList.reduce((acc, item) => {
            return acc + item.amount;
          }, 0);

          (item as AccountWithCurrentBalance).current_balance = total;
        }),
      );

      return accountList as ListResult<AccountWithCurrentBalance>;
    },
    {
      key: 'accounts',
    },
  );
}

export default function Wallets() {
  const [isOpen, setIsOpen] = createSignal(false);
  const users = useRouteData<typeof routeData>();

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
            Agregar Cartera
          </button>
        }
      />
      <div class="mb-20">
        <Show when={users()?.totalItems === 0}>
          <p class="text-gray-500">No accounts found</p>
        </Show>
        <Show when={users()?.totalItems !== 0}>
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
                    Name
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Balance
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Type
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <For each={users()?.items}>
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
                        {item.name}
                      </th>

                      <td class="px-6 py-4">{item.current_balance}</td>
                      <td class="px-6 py-4">{item.expand.name}</td>
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
        <DrawerAccountForm className="mt-10" isOpen={isOpen()} onToggle={() => setIsOpen(false)} />
      </Show>
    </>
  );
}
