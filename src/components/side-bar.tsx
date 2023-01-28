import { A } from '@solidjs/router';

import type { JSX } from 'solid-js';
import { TbWallet } from 'solid-icons/tb';
import { IoWalletOutline, IoWallet } from 'solid-icons/io';
import { CgArrowsExchange } from 'solid-icons/cg';
import { CgCalculator } from 'solid-icons/cg';
import { BsWallet } from 'solid-icons/bs';
export interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  size?: string | number;
  color?: string;
  title?: string;
  style?: JSX.CSSProperties;
}

export default function SideBar() {
  return (
    // :class="sideBarOpen ? '' : 'hidden'" id="main-nav"
    <div class="w-1/2 md:w-1/3 lg:w-64 fixed md:top-0 md:left-0 h-screen lg:block bg-white border-r z-30 hidden">
      {/* <div class="w-full h-20 flex px-4 items-center mb-5">
        <p class="font-semibold text-3xl text-blue-400 pl-4">😶‍🌫️</p>
      </div> */}

      <div class="mb-4 mt-5 px-4 space-y-1 text-gray-700">
        {/* <p class="pl-4 text-sm font-semibold mb-1">Menu</p> */}
        <A
          href="/app/budgets"
          class="w-full flex items-center h-10 pl-4 hover:bg-gray-200 rounded-sm cursor-pointer"
          activeClass="bg-gray-200"
        >
          <CgCalculator class="h-6 w-6 mr-4" />
          <span class="text-gray-700">Presupuesto</span>
        </A>
        <A
          href="/app/transactions"
          class="w-full flex items-center h-10 pl-4 hover:bg-gray-200 rounded-sm cursor-pointer"
          activeClass="bg-gray-200"
        >
          <CgArrowsExchange class="h-6 w-6 mr-4" />
          <span class="text-gray-700">Transactions</span>
        </A>
        <A
          href="/app/wallets"
          class="w-full flex items-center h-10 pl-4 hover:bg-gray-200 rounded-sm cursor-pointer"
          activeClass="bg-gray-200"
        >
          <BsWallet class="h-6 w-6 mr-4" />
          <span class="text-gray-700">Accounts</span>
        </A>
      </div>
    </div>
  );
}
