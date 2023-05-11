import { For, Show, Suspense } from 'solid-js';
import { createServerData$ } from 'solid-start/server';
import { A, RouteDataArgs, useParams, useRouteData, useSearchParams } from 'solid-start';
import { initPocketBase } from '~/db';
import 'shepherd.js/dist/css/shepherd.css';
import { TbArrowRight, TbDots } from 'solid-icons/tb';
import { BUDGET_CATEGORIES_TRANSLATIONS } from '~/utils/budget_categories_translations';
import { INCOME_CATEGORIES_TRANSLATIONS } from '~/utils/income_categories_translations';
import { CgSpinnerAlt } from 'solid-icons/cg';

interface AccountBalanceRoot {
  balance: number;
  collectionId: string;
  collectionName: string;
  id: string;
  transactions_amount: number;
  user_id: string;
  created: string;
  updated: string;
  expand: any;
}
interface AccountDataRoot {
  account_type_id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  field: string;
  id: string;
  name: string;
  updated: string;
  user_id: string;
  expand: any;
}

interface TransactionListItem {
  account_id: string;
  amount: number;
  budget_cat_id_: string;
  collectionId: string;
  collectionName: string;
  created: string;
  date: string;
  description: string;
  id: string;
  income_category_id: string;
  transaction_type: string;
  updated: string;
  user_id: string;
  expand: {
    income_category_id: {
      collectionId: string;
      collectionName: string;
      created: string;
      description: string;
      id: string;
      name: string;
      updated: string;
    };
    budget_cat_id_: {
      collectionId: string;
      collectionName: string;
      created: string;
      group_id: string;
      id: string;
      name: string;
      updated: string;
    };
  };
}

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(
    async ([_, id], { request }) => {
      const pb = await initPocketBase(request);

      const accountData = await pb.collection('accounts').getOne<AccountDataRoot>(id);
      const accountBalance = await pb.collection('accounts_balance').getOne<AccountBalanceRoot>(id);
      const accountTransactions = await pb.collection('transactions').getFullList<TransactionListItem>(undefined, {
        expand: 'budget_cat_id_,income_category_id',
      });

      return { account_balance: accountBalance, account_data: accountData, account_transactions: accountTransactions };
    },
    {
      key: ['accounts', params.account_id],
    },
  );
}

export default function WalletsDetails() {
  const params = useParams();
  const accountBalanceQuery = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <>
      <div class="mb-20 mt-6 md:mt-0">
        <div>
          <Suspense
            fallback={
              <div class="flex items-center justify-center">
                <CgSpinnerAlt class="h-10  w-10 animate-spin" />
              </div>
            }
          >
            <div class="bg-gray-50 py-3">
              <h2 class="text-emphasis mb-2 pl-4 text-3xl tracking-tight lg:leading-none">
                {accountBalanceQuery()?.account_data?.name}
              </h2>
              <div class="px-4">
                <p class="text-2xl font-bold tracking-tight lg:text-5xl lg:font-extrabold lg:leading-none">
                  Balance&nbsp;
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(accountBalanceQuery()?.account_balance?.balance || 0)}
                </p>
                <p class="ml-1 mt-1 text-sm text-gray-500">
                  Total transactions: {accountBalanceQuery()?.account_balance?.transactions_amount}
                </p>
              </div>
            </div>
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
                    <th scope="col" class="min-w-[1%] px-6 py-3 text-lg">
                      <TbDots />
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <For each={accountBalanceQuery()?.account_transactions} fallback={<div>Loading...</div>}>
                    {(item) => (
                      <tr class="cursor-pointer border-b hover:bg-gray-100" tabIndex="0">
                        <td class="w-4 p-4">
                          <div class="flex items-center">
                            <input id="checkbox-table-search-3" type="checkbox" class="h-5 w-5 cursor-pointer" />
                            <label for="checkbox-table-search-3" class="sr-only">
                              checkbox
                            </label>
                          </div>
                        </td>
                        <td class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 ">{item.description}</td>
                        <td class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 ">
                          {new Intl.DateTimeFormat(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: '2-digit',
                          }).format(new Date(item.date))}
                        </td>

                        <td class="px-6 py-4 font-semibold">
                          <span class={item.amount < 0 ? 'text-red-500' : 'text-green-500'}>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(item.amount)}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          {item.transaction_type === 'income'
                            ? INCOME_CATEGORIES_TRANSLATIONS[
                                item.expand.income_category_id.name as keyof typeof INCOME_CATEGORIES_TRANSLATIONS
                              ] || item.expand.income_category_id.name
                            : BUDGET_CATEGORIES_TRANSLATIONS[
                                item.expand.budget_cat_id_.name as keyof typeof BUDGET_CATEGORIES_TRANSLATIONS
                              ] || item.expand.budget_cat_id_.name}
                        </td>
                        <td class="w-[1%] space-x-3 px-6 py-4 text-lg">
                          <TbArrowRight />
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Suspense>
        </div>
      </div>
    </>
  );
}
