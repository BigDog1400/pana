import { For, Show, lazy, createSignal } from 'solid-js';
import { useMatch } from 'solid-start';
import type { JSX } from 'solid-js/jsx-runtime';
import { CgMenu } from 'solid-icons/cg';
import { cx } from 'cva';

const DynamicMobileMenu = lazy(() => import('./drawer-menu'));
interface Props {
  rightElement?: JSX.Element;
  leftElement?: JSX.Element;
  classLeftElementWrapper?: string;
  classRightElementWrapper?: string;
  classNavBarWrapper?: string;
}

export default function NavBar(props: Props) {
  const [isOpen, setIsOpen] = createSignal(false);
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
    <>
      <div class="z-40">
        <div class={cx('flex h-20 w-full items-center justify-between px-6', props.classNavBarWrapper)}>
          {/* <!-- left navbar --> */}
          <div class="flex">
            {/* <!-- mobile hamburger --> */}
            <div class="mr-4 flex items-center lg:hidden">
              <button
                class="navbar-burger hover:border-white hover:text-blue-500 focus:outline-none"
                onClick={() => setIsOpen(!isOpen())}
              >
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
          </div>
          <Show when={props.leftElement}>
            <div class={props.classLeftElementWrapper}>{props.leftElement}</div>
          </Show>

          {/* <!-- right navbar --> */}
          {/* add | html entity */}
          <Show when={props.rightElement}>
            <div class={props.classRightElementWrapper}>{props.rightElement}</div>
          </Show>
        </div>
      </div>
      <Show when={isOpen()}>
        <DynamicMobileMenu isOpen={isOpen()} onToggle={() => setIsOpen(!isOpen())} />
      </Show>
    </>
  );
}
