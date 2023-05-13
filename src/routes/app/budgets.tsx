import NavBar from '~/components/nav-bar';
import { RiSystemAddFill } from 'solid-icons/ri';
import { createSignal, For, Show, Suspense } from 'solid-js';
import { createServerData$ } from 'solid-start/server';
import { A, RouteDataArgs, useLocation, useRouteData } from 'solid-start';
import { initPocketBase } from '~/db';
import { TbArrowLeft, TbDots } from 'solid-icons/tb';
import { TbArrowRight } from 'solid-icons/tb';
import { DrawerBudgetTargetForm } from '~/components/drawer-budget-target-form';
import { Button } from '~/modules/ui/components/button';
import { DrawerUpdateTargetBudgetForm } from '~/components/drawer-update-target-budget-form';
import { DrawerBudgetCategoryTargetForm } from '~/components/drawer-budget-category-form';
import { ClientResponseError } from 'pocketbase';
import { DrawerBudgetForm } from '~/components/drawer-budget-form';
import { BUDGET_GROUPS_TRANSLATIONS } from '~/utils/budget_groups_translations';
import { BUDGET_CATEGORIES_TRANSLATIONS } from '~/utils/budget_categories_translations';
import { drawerBudgetFormIsOpen } from '~/global-signals/drawer-budget-form-is-open';

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
      const date = new Date(
        Date.UTC(Number(year) || new Date().getFullYear(), month ? Number(month) : new Date().getMonth()),
      );

      const result = date.toISOString().split('T')[0];
      const [year_, month_] = result.split('-');

      console.log('year', year_);
      console.log('month', month_);

      const pb = await initPocketBase(request);

      const resultList = await pb.collection('budget_groups').getFullList<Root2>(undefined, {
        expand: 'budget_categories(group_id)',
      });

      // console.log(JSON.stringify(resultList, null, 2));
      // Map over each budget group
      const updatedResultList = await Promise.all(
        resultList?.map(async (group) => {
          // Map over each budget category within the group
          const categories = group.expand['budget_categories(group_id)'] || [];

          const updatedCategories = await Promise.all(
            categories.map(async (category) => {
              try {
                // Right now a user can create a transaction for a month that has no budget target
                const budget_target = await pb
                  .collection('budget_targets')
                  .getFirstListItem<BudgetTarget>('', {
                    filter: `budget_cat_id = "${category.id}" && date ~ "${year_}-${month_}"`,
                    $autoCancel: false,
                  })
                  .catch((e) => {
                    if (e instanceof ClientResponseError) {
                      console.log('ClientResponseError');
                      console.log(e.originalError);
                    }
                    return {} as BudgetTarget;
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

      return updatedResultList;
    },
    {
      key: () => ['budget_groups', location.query['m'], location.query['y']],
    },
  );
}

export default function Budget() {
  const budgets = useRouteData<typeof routeData>();
  const [showDrawer, setShowDrawer] = drawerBudgetFormIsOpen;
  const location = useLocation();

  const getPreviousDate = () => {
    if (location.query['m'] === '0' || new Date().getMonth() === 0) {
      return '/app/budgets?m=11&y=' + (Number(location.query['y']) - 1 || new Date().getFullYear() - 1);
    } else {
      const month = location.query['m'] ? Number(location.query['m']) - 1 : new Date().getMonth() - 1;
      return '/app/budgets?m=' + month + '&y=' + (location.query['y'] || new Date().getFullYear());
    }
  };

  const getNextDate = () => {
    if (location.query['m'] === '11' || new Date().getMonth() === 11) {
      return '/app/budgets?m=0&y=' + (Number(location.query['y']) + 1 || new Date().getFullYear() + 1);
    } else {
      return (
        '/app/budgets?m=' +
        (Number(location.query['m']) + 1 || new Date().getMonth() + 1) +
        '&y=' +
        (location.query['y'] || new Date().getFullYear())
      );
    }
  };

  return (
    <>
      {/* <NavBar
        rightElement={
          <div class="flex flex-wrap gap-2">
            <Button variant={'outline'} fw={'semibold'} onClick={() => setShowDrawer(true)}>
              <RiSystemAddFill />
              Add budget group
            </Button>
            <div class="hidden lg:block">
              <A
                href={getPreviousDate()}
                class="inline-flex min-h-[2.5rem] items-center justify-center gap-2 rounded-md border-2 border-black bg-transparent py-1 px-5 text-sm font-semibold text-black transition-all hover:bg-opacity-90"
              >
                <TbArrowLeft />
              </A>
              <span class="mx-2 font-semibold capitalize text-gray-500">
                {new Date(
                  Number(location.query['y']) || new Date().getFullYear(),
                  location.query['m'] ? Number(location.query['m']) : new Date().getMonth(),
                ).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <A
                href={getNextDate()}
                class="inline-flex min-h-[2.5rem] items-center justify-center gap-2 rounded-md border-2 border-black bg-transparent py-1 px-5 text-sm font-semibold text-black transition-all hover:bg-opacity-90"
              >
                <TbArrowRight />
              </A>
            </div>
          </div>
        }
      /> */}
      <div class="mt-2">
        <div class="flex flex-wrap items-center justify-end gap-2 px-2 pb-2 lg:hidden">
          <A
            href={getPreviousDate()}
            class="inline-flex min-h-[2.5rem] items-center justify-center gap-2 rounded-md border-2 border-black bg-transparent py-1 px-5 text-sm font-semibold text-black transition-all hover:bg-opacity-90"
          >
            <TbArrowLeft />
          </A>
          <span class="mx-2 font-semibold capitalize text-gray-500">
            {new Date(
              Number(location.query['y']) || new Date().getFullYear(),
              location.query['m'] ? Number(location.query['m']) : new Date().getMonth(),
            ).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <A
            href={getNextDate()}
            class="inline-flex min-h-[2.5rem] items-center justify-center gap-2 rounded-md border-2 border-black bg-transparent py-1 px-5 text-sm font-semibold text-black transition-all hover:bg-opacity-90"
          >
            <TbArrowRight />
          </A>
        </div>

        <Suspense fallback={<div class="flex items-center justify-center">Loading...</div>}>
          <Show
            when={budgets() !== undefined && Array.isArray(budgets()) && budgets()?.length! > 0}
            fallback={
              <div class="text-center">
                <h6 class="text-gray-500">No budgets found</h6>
                <Button variant={'outline'} fw={'semibold'} onClick={() => setShowDrawer(true)} class="mt-4">
                  <RiSystemAddFill />
                  Add budget group
                </Button>
              </div>
            }
          >
            <For each={budgets()}>{(group) => <BudgetGroup group={group} />}</For>
          </Show>
        </Suspense>
      </div>
      <DrawerBudgetForm isOpen={showDrawer()} onToggle={() => setShowDrawer((prev) => !prev)} />
    </>
  );
}

function BudgetGroup(props: { group: Root2 }) {
  const [showDrawer, setShowDrawer] = createSignal(false);

  return (
    <>
      <div>
        <div class="flex items-center justify-between bg-gray-100 py-4 pl-6 pr-4">
          <h3 class="text-2xl font-light capitalize md:text-4xl">
            {BUDGET_GROUPS_TRANSLATIONS?.[props.group.name as keyof typeof BUDGET_GROUPS_TRANSLATIONS] ||
              props.group.name.toLowerCase()}
          </h3>
          <Button
            variant={'outline'}
            fw="semibold"
            onClick={() => {
              setShowDrawer(true);
            }}
            class="min-w-max"
          >
            <RiSystemAddFill />
            Add category
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
              <For each={props.group.expand['budget_categories(group_id)']}>
                {(item) => <BudgetCategory data={item} />}
              </For>
            </tbody>
          </table>
        </div>
      </div>
      <DrawerBudgetCategoryTargetForm
        budgetGroup={{
          id: props.group.id,
        }}
        isOpen={showDrawer()}
        onToggle={() => {
          setShowDrawer(!showDrawer());
        }}
      />
    </>
  );
}

function BudgetCategory(props: { data: BudgetCategoriesGroupId }) {
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [showUpdateModal, setShowUpdateModal] = createSignal(false);
  return (
    <>
      <tr
        class="cursor-pointer border-b hover:bg-gray-100"
        onClick={() => {
          if (props.data.expand.budget_target?.id) {
            setShowUpdateModal(true);
          } else {
            setShowCreateModal(true);
          }
        }}
        tabIndex="0"
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            if (props.data.expand.budget_target?.id) {
              setShowUpdateModal(true);
            } else {
              setShowCreateModal(true);
            }
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
          <span class="txt-ellipsis">
            {BUDGET_CATEGORIES_TRANSLATIONS[props.data?.name as keyof typeof BUDGET_CATEGORIES_TRANSLATIONS] ||
              props.data?.name}
          </span>
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
              }).format(props.data.expand.budget_target?.budgeted_amount + props.data.expand.budget_target?.expend)
            : 0}
        </th>

        <td class="w-[1%] space-x-3 px-6 py-4 text-lg">
          <TbArrowRight />
        </td>
      </tr>
      <Show when={!props?.data?.expand?.budget_target?.id && showCreateModal()}>
        <DrawerBudgetTargetForm
          date={
            new Date(
              Date.UTC(
                Number(props.data.expand.budget_target?.year) || new Date().getFullYear(),
                Number(props.data.expand.budget_target?.month) || new Date().getMonth(),
              ),
            )
          }
          budgetCategory={{
            group_id: props.data.group_id,
            id: props.data.id,
            name: props.data.name,
          }}
          isOpen={showCreateModal()}
          onToggle={() => {
            setShowCreateModal(!showCreateModal());
          }}
        />
      </Show>
      <Show when={props?.data?.expand?.budget_target?.id && showUpdateModal()}>
        <DrawerUpdateTargetBudgetForm
          initialValues={{
            amount: props.data.expand.budget_target?.budgeted_amount!,
            id: props.data.expand.budget_target?.id!,
          }}
          isOpen={showUpdateModal()}
          onToggle={() => {
            setShowUpdateModal(!showUpdateModal());
          }}
        />
      </Show>
    </>
  );
}
