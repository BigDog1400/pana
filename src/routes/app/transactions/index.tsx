import { RiSystemAddFill } from 'solid-icons/ri';
import { TbDots } from 'solid-icons/tb';
import { createSignal, For, onCleanup, onMount, Show, Suspense } from 'solid-js';
import { ErrorBoundary, RouteDataArgs, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { DrawerTransactionForm } from '~/components/drawer-transaction-form';
import NavBar from '~/components/nav-bar';
import { initPocketBase } from '~/db';
import { Button } from '~/modules/ui/components/button';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { checkLocalStorageForTourDisplay, setLocalStorageForTourCompleted } from '~/utils/localstorage-tour';
import { BUDGET_CATEGORIES_TRANSLATIONS } from '~/utils/budget_categories_translations';
import { INCOME_CATEGORIES_TRANSLATIONS } from '~/utils/income_categories_translations';
import { drawerTransactionFormIsOpen } from '~/global-signals/drawer-transaction-form-is-open';

const tour = new Shepherd.Tour({
  useModalOverlay: true,
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
    classes: 'class-1 class-2',
    scrollTo: { behavior: 'smooth', block: 'center' },
    when: {
      hide() {
        setLocalStorageForTourCompleted('transaction-tour-completed');
      },
      cancel() {
        setLocalStorageForTourCompleted('transaction-tour-completed');
      },
    },
  },
});

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
        transaction_type: 'income' | 'expense';
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
          income_category_id: {
            collectionId: string;
            collectionName: string;
            created: string;
            description: string;
            id: string;
            name: string;
            updated: string;
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
        expand: 'budget_cat_id_,account_id,income_category_id',
      });

      return resultList;
    },
    {
      key: 'transactions',
    },
  );
}

export default function Transactions() {
  const [isOpen, setIsOpen] = drawerTransactionFormIsOpen;
  const transactions = useRouteData<typeof routeData>();
  onMount(() => {
    if (checkLocalStorageForTourDisplay('transaction-tour-completed')) return;
    // Add event listener to #add-transaction-button to trigger next step
    const addTransactionButton = document.getElementById('add-transaction-button');

    if (addTransactionButton) {
      addTransactionButton.addEventListener('click', () => {
        setTimeout(() => {
          tour.next();
        }, 500);
      });
    }
    tour.addStep({
      title: 'Adding your first transaction',
      text: `Click on the button above to add your first transaction.`,
      attachTo: {
        element: '#add-transaction-button',
        on: 'bottom',
      },
      classes: '',
      id: 'creating',
    });

    tour.addStep({
      title: 'Adding your first transaction',
      text: `Select the type of transaction you want to add. You can add an expense or an income.`,
      cancelIcon: {
        enabled: true,
      },
      attachTo: {
        element: '#transaction-type-select',
        on: 'bottom',
      },
      id: 'creating2',
      buttons: [
        {
          action() {
            return this.next();
          },
          text: 'Next',
        },
      ],
    });

    tour.addStep({
      title: 'Adding your first transaction',
      text: `Complete the form, you can add a description, the date, the amount, the category to which the transaction belongs and the account from which the transaction is made.`,
      attachTo: {
        element: '#transaction-form',
        on: 'left',
      },
      modalOverlayOpeningPadding: 5,

      id: 'creating3',
      buttons: [
        {
          action() {
            const form = document.getElementById('transaction-form');
            if (form) {
              (form as HTMLFormElement).requestSubmit();
            }
            return this.next();
          },
          text: 'Next',
        },
      ],
    });

    tour.start();
  });

  onCleanup(() => {
    setIsOpen(false);
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
                  Description
                </th>
                <th scope="col" class="px-6 py-3">
                  Date
                </th>
                <th scope="col" class="px-6 py-3">
                  Amount
                </th>
                <th scope="col" class="px-6 py-3">
                  Category
                </th>
                <th scope="col" class="px-6 py-3">
                  Account
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
                  when={transactions()}
                  fallback={
                    <tr class="border-b hover:bg-gray-100 ">
                      <td class="w-4 p-4 text-center" colSpan={99}>
                        <h6>No transactions found</h6>
                        <Button variant={'outline'} class="mt-4" onClick={() => setIsOpen(true)} fw="semibold">
                          <RiSystemAddFill class="font-semibold" />
                          Add transaction
                        </Button>
                      </td>
                    </tr>
                  }
                >
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
                          {new Intl.DateTimeFormat('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: '2-digit',
                          }).format(new Date(item.date))}
                        </th>
                        <th scope="row" class="whitespace-nowrap px-6 py-4 font-semibold text-gray-900 ">
                          {item.transaction_type === 'income' ? (
                            <span class="text-green-500">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                              }).format(item.amount)}
                            </span>
                          ) : (
                            <span class="text-red-500">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                              }).format(item.amount)}
                            </span>
                          )}
                        </th>
                        <th scope="row" class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 ">
                          {item.transaction_type === 'income'
                            ? INCOME_CATEGORIES_TRANSLATIONS[
                                item.expand?.income_category_id?.name as keyof typeof INCOME_CATEGORIES_TRANSLATIONS
                              ] || item.expand?.income_category_id?.name
                            : BUDGET_CATEGORIES_TRANSLATIONS[
                                item.expand.budget_cat_id_.name as keyof typeof BUDGET_CATEGORIES_TRANSLATIONS
                              ] || item.expand.budget_cat_id_.name}
                        </th>
                        <th scope="row" class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 ">
                          {item.expand.account_id.name}
                        </th>

                        <td class="w-[1%] space-x-3 px-6 py-4 text-lg"></td>
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
