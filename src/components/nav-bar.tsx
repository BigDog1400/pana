import { For, Show } from 'solid-js';
import { useMatch } from 'solid-start';
import type { JSX } from 'solid-js/jsx-runtime';
import { CgMenu } from 'solid-icons/cg';
interface Props {
  rightElement?: JSX.Element;
}

export default function NavBar(props: Props) {
  const breadcrumbs = [
    {
      name: 'Transactions',
      path: '/app/transactions',
      children: [
        {
          name: 'Detalles de transacción',
          path: '/app/transactions/:id',
        },
      ],
    },
    {
      name: 'Budgets',
      path: '/app/budgets',
    },
    {
      name: 'Accounts',
      path: '/app/wallets',
    },
  ];

  const activeBreadcrumbs = () => {
    let activeBreadcrumbs = [];
    for (let i = 0; i < breadcrumbs.length; i++) {
      const breadcrumb = breadcrumbs[i];
      if (useMatch(() => breadcrumb.path)()) {
        activeBreadcrumbs.push(breadcrumb);
        break;
      } else if (breadcrumb.children) {
        for (let j = 0; j < breadcrumb.children.length; j++) {
          const child = breadcrumb.children[j];
          if (useMatch(() => child.path)()) {
            activeBreadcrumbs.push(breadcrumb);
            activeBreadcrumbs.push(child);
            break;
          }
        }
      }
    }
    return activeBreadcrumbs;
  };

  return (
    <div class="z-40">
      <div class="flex h-20 w-full items-center justify-between px-6">
        {/* <!-- left navbar --> */}
        <div class="flex">
          {/* <!-- mobile hamburger --> */}
          <div class="mr-4 flex items-center lg:hidden">
            {/* @click="toggleSidebar() */}
            <button class="navbar-burger hover:border-white hover:text-blue-500 focus:outline-none">
              <svg
                class="h-5 w-5"
                v-bind:style="{ fill: 'black' }"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Menu</title>
                <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
              </svg>
            </button>
          </div>
          {/* Breadcumbs */}
          <div class="hidden items-center lg:flex">
            <For each={activeBreadcrumbs()}>
              {(breadcrumb, index) => (
                <div class="items flex">
                  <span
                    class={`text-xl ${index() === activeBreadcrumbs().length - 1 ? 'text-black' : 'text-gray-500'}`}
                  >
                    {breadcrumb.name} {index() === activeBreadcrumbs().length - 1 ? '' : '/'}&nbsp
                  </span>
                </div>
              )}
            </For>
          </div>
          {/* <!-- search bar --> */}
          {/* <div class="relative text-gray-600">
            <input
              type="search"
              name="serch"
              placeholder="Search products..."
              class="bg-white h-10 w-full xl:w-64 px-5 rounded-lg border text-sm focus:outline-none"
            />
            <button type="submit" class="absolute right-0 top-0 mt-3 mr-4">
              <svg
                class="h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                id="Capa_1"
                x="0px"
                y="0px"
                viewBox="0 0 56.966 56.966"
                style="enable-background:new 0 0 56.966 56.966;"
                width="512px"
                height="512px"
              >
                <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
              </svg>
            </button>
          </div> */}
        </div>
        {/* <!-- right navbar --> */}
        {/* add | html entity */}
        <div class="">{props.rightElement}</div>
      </div>

      {/* <!-- dropdown menu start --> */}
      {/*  :class="dropDownOpen ? '' : 'hidden' */}
      {/* <div class="absolute bg-gray-100 border border-t-0 shadow-xl text-gray-700 rounded-b-lg w-48 bottom-10 right-0 mr-6 hidden">
        <a href="#" class="block px-4 py-2 hover:bg-gray-200">
          Account
        </a>
        <a href="#" class="block px-4 py-2 hover:bg-gray-200">
          Settings
        </a>
        <a href="#" class="block px-4 py-2 hover:bg-gray-200">
          Logout
        </a>
      </div> */}
      {/* <!-- dropdown menu end --> */}
    </div>
  );
}
