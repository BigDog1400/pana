import { A } from '@solidjs/router';

import type { JSX } from 'solid-js';
import { TbWallet } from 'solid-icons/tb';
import { IoWalletOutline, IoWallet } from 'solid-icons/io';
import { CgArrowsExchange } from 'solid-icons/cg';
import { CgCalculator } from 'solid-icons/cg';
import { BsWallet } from 'solid-icons/bs';
import { Button } from '~/modules/ui/components/button';
import { createServerAction$ } from 'solid-start/server';
import { logout } from '~/db/session';
export interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  size?: string | number;
  color?: string;
  title?: string;
  style?: JSX.CSSProperties;
}

export default function SideBar() {
  const [, { Form }] = createServerAction$((f: FormData, { request }) => logout(request));

  return (
    // :class="sideBarOpen ? '' : 'hidden'" id="main-nav"
    <div class="fixed z-30 hidden h-screen w-1/2 border-r bg-white md:top-0 md:left-0 md:w-1/3 lg:block lg:w-64">
      {/* <div class="w-full h-20 flex px-4 items-center mb-5">
        <p class="font-semibold text-3xl text-blue-400 pl-4">😶‍🌫️</p>
      </div> */}
      <div class="flex h-full flex-col">
        <div class="mb-4 mt-5 space-y-1 px-4 text-gray-700">
          {/* <p class="pl-4 text-sm font-semibold mb-1">Menu</p> */}
          <A
            href="/app/budgets"
            class="flex h-10 w-full cursor-pointer items-center rounded-sm pl-4 hover:bg-gray-200"
            activeClass="bg-gray-200"
          >
            <CgCalculator class="mr-4 h-6 w-6" />
            <span class="text-gray-700">Presupuesto</span>
          </A>
          <A
            href="/app/transactions"
            class="flex h-10 w-full cursor-pointer items-center rounded-sm pl-4 hover:bg-gray-200"
            activeClass="bg-gray-200"
          >
            <CgArrowsExchange class="mr-4 h-6 w-6" />
            <span class="text-gray-700">Transactions</span>
          </A>
          <A
            href="/app/wallets"
            class="flex h-10 w-full cursor-pointer items-center rounded-sm pl-4 hover:bg-gray-200"
            activeClass="bg-gray-200"
          >
            <BsWallet class="mr-4 h-6 w-6" />
            <span class="text-gray-700">Accounts</span>
          </A>
        </div>
        <div class="mt-auto space-y-1 px-4 text-gray-700">
          <Form>
            <Button name="logout" type="submit" variant={'secondary'} width="full" fw={'semibold'}>
              Logout
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
