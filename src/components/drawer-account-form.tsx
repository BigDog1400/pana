import { Show } from 'solid-js';
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
import { Input, Select } from '~/modules/ui/components/form';
import { Button } from '~/modules/ui/components/button';

interface Props {
  className?: string;
  isOpen: boolean;
  onToggle: () => void;
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
      invalidate: 'accounts',
    },
  );

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
              <div class="mt-10 flex flex-col items-center justify-center">
                <div class="flex items-center text-green-500">
                  <AiFillCheckCircle size={40} color="currentColor" />
                </div>
                <p class="text-xl font-semibold text-gray-900">Your account was created successfully.</p>

                <p class="text-lg text-gray-900">You can now add transactions to your account</p>
                <div class="mt-10">
                  <a
                    href="#"
                    class="inline-flex w-full items-center  rounded border border-transparent bg-black px-6 py-4 text-base font-bold text-white shadow-sm  hover:bg-opacity-90"
                  >
                    Add transactions
                  </a>
                </div>
              </div>
            }
          >
            <Form class={'mt-6'} id="account-form">
              <div class="mb-6 w-full">
                <label for="name" class="mb-2 block text-sm font-semibold text-gray-900">
                  Name of the account
                </label>
                <Input type="text" name="name" id="name" placeholder="Name" required />
              </div>
              <div class="mb-6 w-full">
                <label for="current_balance" class="mb-2 block text-sm font-semibold text-gray-900">
                  Current Balance
                </label>
                <Input
                  type="number"
                  name="current_balance"
                  id="current_balance"
                  placeholder="Current Balance"
                  required
                />
              </div>
              <fieldset class="mb-6 w-full">
                <label for="account_type" class="mb-2 block text-sm font-semibold text-gray-900">
                  Account Type
                </label>
                <Select id="account_type" name="account_type">
                  <option selected>Choose an option</option>
                  <option value="bdhvh7pit9pkdi9">Savings</option>
                  <option value="c5zxtv3kgz5yxbb">Checking</option>
                </Select>
              </fieldset>
              <div class="mb-6 w-full"></div>
            </Form>
          </Show>
        </DrawerBody>

        <Show when={!enrolling.result}>
          <DrawerFooter>
            <div class="flex justify-end gap-2">
              <Button variant={'secondary'} fw="semibold">
                Cancelar
              </Button>
              <Button form="account-form" type="submit" fw="semibold" disabled={enrolling.pending}>
                Agregar
              </Button>
            </div>
          </DrawerFooter>
        </Show>
      </DrawerContent>
    </Drawer>
  );
}
