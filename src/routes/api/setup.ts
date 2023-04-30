import { ClientResponseError } from 'pocketbase';
import { APIEvent, json, redirect } from 'solid-start/api';
import { initPocketBase } from '~/db';
const budget_groups = [
  {
    id: 1,
    name: 'Housing',
    categories: [
      {
        id: 1,
        name: 'Rent/Mortgage',
      },
      {
        id: 2,
        name: 'Utilities (Electricity, Water, etc.)',
      },
      {
        id: 3,
        name: 'Internet/Phone',
      },
      {
        id: 20,
        name: 'Home Maintenance/Repairs',
      },
    ],
  },
  {
    id: 2,
    name: 'Transportation',
    categories: [
      {
        id: 4,
        name: 'Car Payment',
      },
      {
        id: 5,
        name: 'Gas/Oil',
      },
      {
        id: 6,
        name: 'Maintenance/Repairs',
      },
      {
        id: 7,
        name: 'Public Transportation',
      },
    ],
  },
  {
    id: 3,
    name: 'Food',
    categories: [
      {
        id: 8,
        name: 'Groceries',
      },
      {
        id: 9,
        name: 'Dining Out',
      },
    ],
  },
  {
    id: 4,
    name: 'Entertainment',
    categories: [
      {
        id: 10,
        name: 'Movies',
      },
      {
        id: 11,
        name: 'Concerts/Shows',
      },
      {
        id: 12,
        name: 'Books/Magazines',
      },
    ],
  },
  {
    id: 5,
    name: 'Personal Care',
    categories: [
      {
        id: 13,
        name: 'Haircuts/Styling',
      },
      {
        id: 14,
        name: 'Cosmetics/Toiletries',
      },
      {
        id: 21,
        name: 'Clothing',
      },
      {
        id: 22,
        name: 'Gym',
      },
    ],
  },
  {
    id: 6,
    name: 'Debt Payments',
    categories: [
      {
        id: 15,
        name: 'Credit Cards',
      },
      {
        id: 16,
        name: 'Loans',
      },
    ],
  },
  {
    id: 7,
    name: 'Savings',
    categories: [
      {
        id: 17,
        name: 'Emergency Fund',
      },
      {
        id: 18,
        name: 'Retirement',
      },
      {
        id: 19,
        name: 'College Fund',
      },
      {
        id: 23,
        name: 'Travel savings',
      },
    ],
  },
];

export async function GET({ params, request }: APIEvent) {
  console.log('params', params);
  try {
    const pb = await initPocketBase(request);
    const userId = pb.authStore.model?.id;
    // const resultList = await pb.collection('budget_groups').create({
    //   name: '',
    //   user_id: userId,
    // })

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
  } catch (error) {
    if (error instanceof ClientResponseError) {
      return json({ error: error.data.message, status: error.status }, { status: error.status });
    }
    return json({ error: 'Unexpected server error.', status: 500 }, { status: 500 });
  }
}
