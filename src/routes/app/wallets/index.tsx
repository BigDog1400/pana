import NavBar from '~/components/nav-bar';
import { RiSystemAddFill } from 'solid-icons/ri';
import { createEffect, createSignal, For, lazy, onCleanup, onMount, Show, Suspense } from 'solid-js';
import { DrawerAccountForm } from '~/components/drawer-account-form';
import { createServerData$ } from 'solid-start/server';
import { A, RouteDataArgs, useNavigate, useRouteData, useSearchParams } from 'solid-start';
import { initPocketBase } from '~/db';
import { ListResult } from 'pocketbase';
import { TbArrowRight, TbDots } from 'solid-icons/tb';
import { Button } from '~/modules/ui/components/button';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { checkLocalStorageForTourDisplay, setLocalStorageForTourCompleted } from '~/utils/localstorage-tour';
import { drawerAccountFormIsOpen } from '~/global-signals/drawer-account-form-is-open';

const tour = new Shepherd.Tour({
  useModalOverlay: true,
  defaultStepOptions: {
    cancelIcon: {
      enabled: false,
    },
    classes: 'class-1 class-2',
    scrollTo: { behavior: 'smooth', block: 'center' },
    when: {
      hide() {
        setLocalStorageForTourCompleted('account-tour-completed');
      },
      cancel() {
        setLocalStorageForTourCompleted('account-tour-completed');
      },
    },
  },
});
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
    account_type_id: {
      collectionId: string;
      collectionName: string;
      created: string;
      id: string;
      name: string;
      updated: string;
      expand: any;
    };
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
  const [isOpen, setIsOpen] = drawerAccountFormIsOpen;
  const accounts = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  onMount(() => {
    if (checkLocalStorageForTourDisplay('account-tour-completed')) return;
    // Add event listener to #add-account-button to trigger next step
    const addTransactionButton = document.getElementById('add-account-button');

    if (addTransactionButton) {
      addTransactionButton.addEventListener('click', () => {
        setTimeout(() => {
          tour.next();
        }, 500);
      });
    }
    tour.addStep({
      title: 'Adding your first account',
      text: `Add your first account to get started. You can add more accounts later.`,
      attachTo: {
        element: '#add-account-button',
        on: 'bottom',
      },
      classes: '',
      id: 'creating',
      on(event, handler) {
        alert(event);
      },
    });

    tour.addStep({
      title: 'Adding your first account',
      text: `Add a name for your account, select the type and the current balance.`,
      modalOverlayOpeningPadding: 5,
      cancelIcon: {
        enabled: true,
      },
      attachTo: {
        element: '#account-form',
        on: 'bottom',
      },
      id: 'creating2',
      buttons: [
        {
          action() {
            const form = document.getElementById('account-form');
            if (form) {
              (form as HTMLFormElement).requestSubmit();
            }
            return this.next();
          },
          text: 'Add account',
        },
      ],
    });
    tour.start();
  });

  onCleanup(() => {
    setIsOpen(false);
  });

  onMount(() => {
    const addAccountButton = document.getElementById('add-account');
    if (addAccountButton) {
      addAccountButton.addEventListener('click', () => {
        setIsOpen(true);
      });
    }
  });
  return (
    <>
      <div class="mb-20">
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
                <th scope="col" class="min-w-[1%] px-6 py-3 text-lg">
                  <TbDots />
                </th>
              </tr>
            </thead>

            <tbody>
              <Suspense
                fallback={
                  <tr class="border-b hover:bg-gray-100 ">
                    <td class="w-4 p-4 text-center" colSpan={99}>
                      <h6>Loading...</h6>
                    </td>
                  </tr>
                }
              >
                <Show
                  when={accounts()}
                  fallback={
                    <tr class="border-b hover:bg-gray-100 ">
                      <td class="w-4 p-4 text-center">
                        <h6>No accounts yet</h6>
                        <Button
                          variant={'outline'}
                          class="mt-4"
                          fw="semibold"
                          id="add-account"
                          onclick={() => setIsOpen(true)}
                        >
                          <RiSystemAddFill class="font-semibold" />
                          Add account
                        </Button>
                      </td>
                    </tr>
                  }
                >
                  <For each={accounts()?.items}>
                    {(item) => (
                      <tr
                        class="cursor-pointer border-b hover:bg-gray-100"
                        tabIndex="0"
                        onkeydown={(e) => {
                          navigate(`/app/wallets/${item.id}`);
                        }}
                        onclick={() => {
                          navigate(`/app/wallets/${item.id}`);
                        }}
                      >
                        <td class="w-4 p-4">
                          <div class="flex items-center">
                            <input id="checkbox-table-search-3" type="checkbox" class="h-5 w-5 cursor-pointer" />
                            <label for="checkbox-table-search-3" class="sr-only">
                              checkbox
                            </label>
                          </div>
                        </td>
                        <td class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 ">
                          <A href={`/app/wallets/${item.id}`} class="font-semibold">
                            <span>{item.name}</span>
                          </A>
                        </td>

                        <td class="px-6 py-4 font-semibold">
                          <span class={item.current_balance < 0 ? 'text-red-500' : 'text-green-500'}>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(item.current_balance)}
                          </span>
                        </td>
                        <td class="px-6 py-4">{item.expand.account_type_id.name}</td>
                        <td class="w-[1%] space-x-3 px-6 py-4 text-lg">
                          <TbArrowRight />
                        </td>
                      </tr>
                    )}
                  </For>
                </Show>
              </Suspense>
            </tbody>
          </table>
        </div>
      </div>

      <Show when={isOpen()}>
        <DrawerAccountForm className="mt-10" isOpen={isOpen()} onToggle={() => setIsOpen(false)} />
      </Show>
    </>
  );
}
