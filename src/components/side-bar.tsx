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
import { FiLogOut } from 'solid-icons/fi';
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
    // <div class="fixed z-30 hidden h-screen w-1/2 border-r bg-white md:top-0 md:left-0 md:w-1/3 lg:block lg:w-64">
    <div class="relative  border-r bg-white lg:w-56 lg:px-4">
      <div class="top-0 flex hidden h-full max-h-screen flex-col  overflow-y-auto overflow-x-hidden md:sticky md:flex">
        {/* App title: simple budget */}
        {/* <span class="mt-2 flex h-8 items-center text-2xl font-bold  text-gray-700">Simple Budget</span> */}
        <div class="mb-4 mt-4 space-y-1 text-gray-700 ">
          <A
            href="/app/budgets"
            class="flex h-10 w-full cursor-pointer items-center rounded-sm pl-4 hover:bg-gray-200"
            activeClass="bg-gray-200"
          >
            <CgCalculator class="mr-4 h-6 w-6" />
            <span class="hidden w-full text-gray-700 lg:flex">Presupuesto</span>
          </A>
          <A
            href="/app/transactions"
            class="flex h-10 w-full cursor-pointer items-center rounded-sm pl-4 hover:bg-gray-200"
            activeClass="bg-gray-200"
          >
            <CgArrowsExchange class="mr-4 h-6 w-6" />
            <span class=" hidden w-full text-gray-700 lg:flex">Transactions</span>
          </A>
          <A
            href="/app/wallets"
            class="flex h-10 w-full cursor-pointer items-center rounded-sm pl-4 hover:bg-gray-200"
            activeClass="bg-gray-200"
          >
            <BsWallet class="mr-4 h-6 w-6" />
            <span class=" hidden w-full text-gray-700 lg:flex">Accounts</span>
          </A>
        </div>
        <div class="mt-auto space-y-1 text-gray-700 ">
          <Form>
            <Button name="logout" type="submit" variant={'secondary'} width="full" fw={'semibold'}>
              <FiLogOut class="lg:hidden" />
              <span class="hidden w-full text-center text-gray-700 lg:block">Logout</span>
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
