import NavBar from '~/components/nav-bar';
import { RiSystemAddFill } from 'solid-icons/ri';
import { createSignal, For, Show, Suspense } from 'solid-js';
import { createServerData$, json } from 'solid-start/server';
import { RouteDataArgs, useRouteData } from 'solid-start';
import { initPocketBase } from '~/db';
import { TbDots, TbPlus } from 'solid-icons/tb';
import { TbArrowRight } from 'solid-icons/tb';
import { DrawerBudgetForm } from '~/components/drawer-budget-form';
import { Button } from '~/modules/ui/components/button';
export interface Root2 {
  collectionId: string;
  collectionName: string;
  created: string;
  expand: Expand;
  id: string;
  name: string;
  updated: string;
  user_id: string;
}

export interface Expand {
  'budget_categories(group_id)': BudgetCategoriesGroupId[];
}

export interface BudgetCategoriesGroupId {
  collectionId: string;
  collectionName: string;
  created: string;
  group_id: string;
  id: string;
  name: string;
  updated: string;
  expand: Expand2;
}

export interface Expand2 {
  budget_target?: BudgetTarget;
}

export interface BudgetTarget {
  budget_cat_id?: string;
  budgeted_amount: number;
  collectionId?: string;
  collectionName?: string;
  created?: string;
  id?: string;
  month?: number;
  updated?: string;
  user_id_?: string;
  year?: number;
  expand?: Expand3;
  expend?: number;
}

export interface Expand3 {}

export function routeData({ location }: RouteDataArgs) {
  return createServerData$(
    async ([_, month, year], { request }) => {
      const date = new Date(Date.UTC(Number(year) || new Date().getFullYear(), Number(month) || new Date().getMonth()));
      const result = date.toISOString().split('T')[0];
      const [year_, month_] = result.split('-');

      const pb = await initPocketBase(request);

      const resultList = await pb.collection('budget_groups').getFullList<Root2>(undefined, {
        expand: 'budget_categories(group_id)',
      });

      console.log(JSON.stringify(resultList, null, 2));
      // Map over each budget group
      const updatedResultList = await Promise.all(
        resultList?.map(async (group) => {
          // Map over each budget category within the group
          const categories = group.expand['budget_categories(group_id)'] || [];
          const updatedCategories = await Promise.all(
            categories.map(async (category) => {
              // Get the full list of budget targets for each category
              try {
                const budget_target = await pb.collection('budget_targets').getFirstListItem<BudgetTarget>('', {
                  filter: `budget_cat_id = "${category.id}" && date ~ "${year_}-${month_}"`,
                  $autoCancel: false,
                });

                const transactions = await pb.collection('transactions').getFullList<{
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
                  expand: any;
                }>(200, {
                  filter: `budget_cat_id_ = "${category.id}" && date ~ "${year_}-${month_}"`,
                  $autoCancel: false,
                });

                const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);

                budget_target['expend'] = total;
                return { ...category, expand: { budget_target } };
              } catch (error) {
                return { ...category, expand: { budget_target: undefined } };
              }
            }),
          );
          // Return the updated budget group with the updated categories
          return { ...group, expand: { 'budget_categories(group_id)': updatedCategories } };
        }),
      );

      // const expendAmount = await pb.collection('transactions').getFullList(200, {
      //   filter: `budget_cat_id = "zo0e8nhva8vlr4i" && date ~ ${result}`,
      //   // $autoCancel: false,
      // });
      // console.log({ expendAmount });
      return updatedResultList;
    },
    {
      key: () => ['budget_groups', location.query['m'], location.query['y']],
    },
    // { key: () => ['students', params.id] },
  );
}

export default function Budget() {
  const budgets = useRouteData<typeof routeData>();
  const [showDrawer, setShowDrawer] = createSignal(false);
  return (
    <>
      <NavBar />
      <div class="">
        {/* This works. It renders the budgets */}

        <Suspense fallback={<div>Cargando...</div>}>
          <For each={budgets()}>{(group) => <BudgetGroup group={group} />}</For>
        </Suspense>
      </div>
    </>
  );
}

function BudgetGroup({ group }: { group: Root2 }) {
  const [showDrawer, setShowDrawer] = createSignal(false);
  return (
    <>
      <div>
        <div class="flex items-center justify-between bg-gray-100 px-6 py-4">
          <h3 class="text-4xl font-light capitalize">{group.name.toLowerCase()}</h3>
          <Button variant={'outline'} fw="semibold" onClick={() => setShowDrawer(true)}>
            <RiSystemAddFill />
            Add new budget target
          </Button>
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
                <th scope="col" class="col-type-text px-6 py-3">
                  Name
                </th>
                <th scope="col" class="col-type-text px-6 py-3">
                  Asigned
                </th>
                <th scope="col" class="col-type-text px-6  py-3">
                  Expend
                </th>
                <th scope="col" class=" col-type-text px-6 py-3">
                  Available
                </th>
                <th scope="col" class="min-w-[1%] px-6 py-3 text-lg">
                  <TbDots />
                </th>
              </tr>
            </thead>
            <tbody>
              <For each={group.expand['budget_categories(group_id)']}>{(item) => <BudgetCategory data={item} />}</For>
            </tbody>
          </table>
        </div>
      </div>
      {/* <DrawerBudgetForm
        isOpen={showDrawer()}
        onToggle={() => {
          setShowDrawer(!showDrawer());
        }}
      /> */}
    </>
  );
}

function BudgetCategory(props: { data: BudgetCategoriesGroupId }) {
  const [showModal, setShowModal] = createSignal(false);
  return (
    <>
      <tr
        class="cursor-pointer border-b hover:bg-gray-100"
        onClick={() => {
          setShowModal(true);
        }}
        tabIndex="0"
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            setShowModal(true);
          }
        }}
      >
        <td class="w-4 p-4">
          <div
            class="flex items-center"
            onclick={(e) => {
              e.stopPropagation();
            }}
          >
            <input id="checkbox-table-search-3" type="checkbox" class="h-5 w-5 cursor-pointer" />
            <label for="checkbox-table-search-3" class="sr-only">
              checkbox
            </label>
          </div>
        </td>

        <th scope="row" class="col-type-text px-6 py-4 font-medium text-gray-900">
          <span class="txt-ellipsis">{props.data?.name}</span>
        </th>
        <th scope="row" class="col-type-text whitespace-nowrap px-6 py-4 font-medium text-gray-900">
          <span class="txt-ellipsis">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(props.data.expand.budget_target?.budgeted_amount || 0)}
          </span>
        </th>
        <th scope="row" class="col-type-text whitespace-nowrap px-6 py-4 font-medium text-gray-900">
          <span class="txt-ellipsis">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(props.data.expand.budget_target?.expend || 0)}
          </span>
        </th>
        <th scope="row" class="col-type-text whitespace-nowrap px-6 py-4 font-medium text-gray-900">
          {props.data.expand.budget_target?.budgeted_amount && props.data.expand.budget_target?.expend
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(props.data.expand.budget_target?.budgeted_amount - props.data.expand.budget_target?.expend)
            : 0}
        </th>

        <td class="w-[1%] space-x-3 px-6 py-4 text-lg">
          <TbArrowRight />
        </td>
      </tr>
      <DrawerBudgetForm
        date={
          new Date(
            Date.UTC(
              Number(props.data.expand.budget_target?.year) || new Date().getFullYear(),
              Number(props.data.expand.budget_target?.month) || new Date().getMonth(),
            ),
          )
        }
        budgetGroup={{
          group_id: props.data.group_id,
          id: props.data.id,
          name: props.data.name,
        }}
        isOpen={showModal()}
        onToggle={() => {
          setShowModal(!showModal());
        }}
      />
    </>
  );
}
