import { A } from '@solidjs/router';

import type { JSX } from 'solid-js';

export interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  size?: string | number;
  color?: string;
  title?: string;
  style?: JSX.CSSProperties;
}

function TbReportMoney(props: IconProps) {
  return (
    <svg
      fill="none"
      stroke-width="2"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      style="overflow: visible;"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z"></path>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"></path>
      <rect width="6" height="4" x="9" y="3" rx="2"></rect>
      <path d="M14 11h-2.5a1.5 1.5 0 000 3h1a1.5 1.5 0 010 3H10M12 17v1m0-8v1"></path>
    </svg>
  );
}

function TbWallet(props: IconProps) {
  return (
    <svg
      fill="none"
      stroke-width="2"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      style="overflow: visible;"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z"></path>
      <path d="M17 8V5a1 1 0 00-1-1H6a2 2 0 000 4h12a1 1 0 011 1v3m0 4v3a1 1 0 01-1 1H6a2 2 0 01-2-2V6"></path>
      <path d="M20 12v4h-4a2 2 0 010-4h4"></path>
    </svg>
  );
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
          href="/app/transactions"
          class="w-full flex items-center h-10 pl-4 hover:bg-gray-200 rounded-sm cursor-pointer"
          activeClass="bg-gray-200"
        >
          <TbReportMoney class="h-6 w-6 mr-2" />
          <span class="text-gray-700">Presupuesto</span>
        </A>
        <A
          href="/app/wallets"
          class="w-full flex items-center h-10 pl-4 hover:bg-gray-200 rounded-sm cursor-pointer"
          activeClass="bg-gray-200"
        >
          <TbWallet class="h-6 w-6 mr-2" />
          <span class="text-gray-700">Carteras</span>
        </A>
      </div>
    </div>
  );
}
