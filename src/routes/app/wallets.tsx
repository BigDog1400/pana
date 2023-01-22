import NavBar from '~/components/nav-bar';
import { RiSystemAddFill } from 'solid-icons/ri';
import { createSignal, For, Show } from 'solid-js';
import { DrawerAccountForm } from '~/components/drawer-account-form';
import { createServerData$ } from 'solid-start/server';
import { RouteDataArgs, useRouteData } from 'solid-start';
import { initPocketBase } from '~/db';

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(
    async (undefined, { request }) => {
      const pb = await initPocketBase(request);
      const resultList = await pb.collection('accounts').getList(1, 50);

      return resultList;
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
            class="text-black  px-5 py-1 border-black border-2 rounded-[3px]
            font-semibold
            bg-white
            inline-flex items-center
            gap-2
            text-sm
            h-10
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
            <table class="table-wrapper w-full text-sm text-left text-gray-500 ">
              <thead class="text-xs uppercase border-b">
                <tr>
                  <th scope="col" class="p-4">
                    <div class="flex items-center">
                      <input
                        id="checkbox-all-search"
                        type="checkbox"
                        class="w-5 h-5 bg-gray-100 border-gray-300 cursor-pointer"
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
                          <input id="checkbox-table-search-3" type="checkbox" class="w-5 h-5 cursor-pointer" />
                          <label for="checkbox-table-search-3" class="sr-only">
                            checkbox
                          </label>
                        </div>
                      </td>
                      <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                        {item.name}
                      </th>

                      <td class="px-6 py-4">{item.current_balance}</td>
                      <td class="px-6 py-4">{item.account_type_id}</td>
                      <td class="flex items-center px-6 py-4 space-x-3">
                        <a href="#" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                          Edit
                        </a>
                        <a href="#" class="font-medium text-red-600 dark:text-red-500 hover:underline">
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
