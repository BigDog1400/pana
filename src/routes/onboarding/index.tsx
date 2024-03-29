import { CgSpinnerAlt } from 'solid-icons/cg';
import { createResource } from 'solid-js';
import { createServerData$, redirect } from 'solid-start/server';
import { initPocketBase } from '~/db';

const budget_groups = [
  {
    id: 1,
    name: 'HOUSING',
    categories: [
      {
        id: 1,
        name: 'RENT_MORTGAGE',
      },
      {
        id: 2,
        name: 'UTILITIES',
      },
      {
        id: 3,
        name: 'INTERNET_PHONE',
      },
      {
        id: 20,
        name: 'HOME_MAINTENANCE_REPAIRS',
      },
    ],
  },
  {
    id: 2,
    name: 'TRANSPORTATION',
    categories: [
      {
        id: 4,
        name: 'CAR_PAYMENT',
      },
      {
        id: 5,
        name: 'GAS_OIL',
      },
      {
        id: 6,
        name: 'MAINTENANCE_REPAIRS',
      },
      {
        id: 7,
        name: 'PUBLIC_TRANSPORTATION',
      },
    ],
  },
  {
    id: 3,
    name: 'FOOD',
    categories: [
      {
        id: 8,
        name: 'GROCERIES',
      },
      {
        id: 9,
        name: 'DINING_OUT',
      },
    ],
  },
  {
    id: 4,
    name: 'ENTERTAINMENT',
    categories: [
      {
        id: 10,
        name: 'MOVIES',
      },
      {
        id: 11,
        name: 'CONCERTS_SHOWS',
      },
      {
        id: 12,
        name: 'GAMING',
      },
    ],
  },
  {
    id: 5,
    name: 'PERSONAL_CARE',
    categories: [
      {
        id: 13,
        name: 'HAIRCUTS_STYLING',
      },
      {
        id: 14,
        name: 'COSMETICS_TOILETRIES',
      },
      {
        id: 21,
        name: 'CLOTHING',
      },
      {
        id: 22,
        name: 'GYM',
      },
    ],
  },
  {
    id: 6,
    name: 'DEBT_PAYMENTS',
    categories: [
      {
        id: 15,
        name: 'CREDIT_CARDS',
      },
      {
        id: 16,
        name: 'LOANS',
      },
    ],
  },
  {
    id: 7,
    name: 'SAVINGS',
    categories: [
      {
        id: 17,
        name: 'EMERGENCY_FUND',
      },
      {
        id: 18,
        name: 'RETIREMENT',
      },
      {
        id: 19,
        name: 'COLLEGE_FUND',
      },
      {
        id: 23,
        name: 'TRAVEL_SAVINGS',
      },
    ],
  },
];

export function routeData() {
  return createServerData$(async (_, { request }) => {
    const pb = await initPocketBase(request);
    const userId = pb.authStore.model?.id;

    // For each budget group, create a budget group record
    // For each budget category, create a budget category record

    const updateResult = await Promise.all(
      budget_groups.map(async (group) => {
        const budgetGroup = await pb.collection('budget_groups').create(
          {
            name: group.name,
            user_id: userId,
          },
          {
            $autoCancel: false,
          },
        );

        console.log('budgetGroup', budgetGroup);

        const budgetCategories = await Promise.all(
          group.categories.map(async (category) => {
            const budgetCategory = await pb.collection('budget_categories').create(
              {
                name: category.name,
                group_id: budgetGroup.id,
              },
              {
                $autoCancel: false,
              },
            );

            return budgetCategory;
          }),
        );

        return budgetGroup;
      }),
    );

    return redirect('/app/wallets', {
      headers: {
        'Set-Cookie': pb.authStore.exportToCookie(),
      },
    });
  });
}

export default function Onboarding() {
  return (
    // big screen with a loading in the middle and a message saying "loading", use tailwindcss
    <div class="flex h-screen flex-col items-center justify-center">
      <CgSpinnerAlt class="text-primary h-10 w-10 animate-spin" />
    </div>
  );
}
