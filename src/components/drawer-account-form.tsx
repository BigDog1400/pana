import { createEffect, createResource, Show, Suspense } from 'solid-js';
import { createServerAction$, json } from 'solid-start/server';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle,
} from '~/components/drawer';
import { initPocketBase } from '~/db';
import { AiFillCheckCircle } from 'solid-icons/ai';
import { createRouteData, RouteDataArgs } from 'solid-start';
interface Props {
  className?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function routeData({ data }: Pick<RouteDataArgs, 'data'>) {
  return createRouteData(async () => {
    console.log(data);
    console.log('Waiting for data');
    const response = await fetch('https://hogwarts.deno.dev/students');
    return await response.json();
  });
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function DrawerAccountForm(props: Props) {
  const [enrolling, { Form }] = createServerAction$(
    async (form: FormData, { request }) => {
      const pb = await initPocketBase(request);
      const userId = pb.authStore.model?.id;

      const record = await pb.collection('accounts').create({
        name: form.get('name') as string,
        current_balance: form.get('current_balance') as string,
        account_type_id: form.get('account_type') as string,
        user_id: userId,
      });

      return json(
        { success: true, data: record },
        {
          headers: {
            'set-cookie': pb.authStore.exportToCookie(),
          },
        },
      );
    },
    {
      invalidate: 'https://hogwarts.deno.dev/students',
    },
  );

  // const [data, { mutate, refetch }] = createResource(async function fetchData(source, { value, refetching }) {
  //   // Fetch the data and return a value.
  //   //`source` tells you the current value of the source signal;
  //   //`value` tells you the last returned value of the fetcher;
  //   //`refetching` is true when the fetcher is triggered by calling `refetch()`,
  //   // or equal to the optional data passed: `refetch(info)`

  //   console.log('Fetching data');
  //   console.log(enrolling.result);
  //   const res = await enrolling.result?.json();
  //   console.log(res);

  //   return res;
  // });

  // const data = createRouteData(async function fetchData() {
  //   console.log('Fetching data');

  //   const res = await enrolling.result?.json();

  //   return res;
  // });
  // const [data, { mutate, refetch }] = createResource(
  //   'https://hogwarts.deno.dev/students',
  //   routeData({
  //     data: enrolling.result,
  //   }),
  // );

  const [data, { refetch }] = createResource(enrolling.result, async () => {
    debugger;
    const res = async () => await enrolling.result?.json();
    console.log(await res());
    return res;
  });

  return (
    <Drawer isOpen={props.isOpen} onToggle={props.onToggle} class="w-full max-w-xl">
      <DrawerOverlay />
      <DrawerContent>
        <Show when={!enrolling.result}>
          <DrawerHeader>
            <DrawerTitle>Create account</DrawerTitle>
            <DrawerDescription>
              Fill the form below to create a new account. You can add transactions to this account later.
            </DrawerDescription>
          </DrawerHeader>
        </Show>
        <DrawerBody>
          <Show
            when={!enrolling.result}
            fallback={
              // success
              <div class="flex flex-col items-center justify-center mt-10">
                <div class="flex items-center text-green-500">
                  <AiFillCheckCircle size={40} color="currentColor" />
                </div>
                <p class="text-xl font-semibold text-gray-900">Your account was created successfully.</p>

                <p class="text-lg text-gray-900">You can now add transactions to your account</p>
                {/* Link button */}
                <div class="mt-10">
                  <a
                    href="#"
                    class="inline-flex items-center px-6  border border-transparent text-base shadow-sm py-4 w-full rounded text-white font-bold bg-black  hover:bg-opacity-90"
                  >
                    Add transactions
                  </a>
                </div>
              </div>
            }
          >
            <Form class={'mt-10'} id="account-form">
              <div class="w-full mb-6">
                <input
                  type="text"
                  name="name"
                  id="name"
                  class="w-full py-4 px-8 bg-slate-100 placeholder:font-semibold rounded hover:ring-1 outline-blue-500
         focus:bg-slate-200 
          "
                  placeholder="Name"
                  required
                />
              </div>
              <div class="w-full mb-6">
                <input
                  type="number"
                  name="current_balance"
                  id="current_balance"
                  class="w-full py-4 px-8 bg-slate-100 placeholder:font-semibold rounded hover:ring-1 outline-blue-500 appearance-none"
                  placeholder="Current Balance"
                  required
                />
              </div>
              <fieldset class="w-full mb-6">
                <label for="account_type" class="">
                  Account Type
                </label>
                <select
                  id="account_type"
                  class="bg-slate-100 border text-md  py-4 mt-2 border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 appearance-none focus:bg-slate-200 "
                >
                  <option selected>Choose an option</option>
                  <option value="bdhvh7pit9pkdi9">Savings</option>
                  <option value="c5zxtv3kgz5yxbb">Checking</option>
                </select>
              </fieldset>
              <div class="w-full mb-6"></div>
            </Form>
          </Show>
        </DrawerBody>

        <Show when={!enrolling.result}>
          <DrawerFooter>
            <div class="flex gap-2 justify-end">
              <button class="py-4 w-full rounded text-black border-2 border-black font-bold bg-white  hover:bg-opacity-90">
                Cancelar
              </button>
              <button
                form="account-form"
                type="submit"
                class="py-4 w-full rounded text-white font-bold bg-black  hover:bg-opacity-90"
                disabled={enrolling.pending}
              >
                Agregar
              </button>
            </div>
          </DrawerFooter>
        </Show>
      </DrawerContent>
    </Drawer>
  );
}
