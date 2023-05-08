import { cx } from 'cva';
import { BsWallet } from 'solid-icons/bs';
import { CgArrowLeft, CgArrowsExchange, CgCalculator, CgUser } from 'solid-icons/cg';
import { FiLogOut } from 'solid-icons/fi';
import { RiSystemAddFill } from 'solid-icons/ri';
import { ComponentProps, JSX, ValidComponent, createEffect, createMemo } from 'solid-js';
import { A, ErrorBoundary, Outlet, useLocation } from 'solid-start';
import { createServerAction$ } from 'solid-start/server';
import SideBar from '~/components/side-bar';
import { logout } from '~/db/session';
import { drawerAccountFormIsOpen } from '~/global-signals/drawer-account-form-is-open';
import { drawerBudgetFormIsOpen } from '~/global-signals/drawer-budget-form-is-open';
import { drawerTransactionFormIsOpen } from '~/global-signals/drawer-transaction-form-is-open';
import { Button } from '~/modules/ui/components/button';

export type NavigationItemType = {
  name: string;
  href: string;
  child?: NavigationItemType[];
  icon?: (props: ComponentProps<ValidComponent>) => JSX.Element;
};

export type HeadingItemType = {
  title: string;
  subtitle?: string;
  CTA: JSX.Element;
  showBackButton?: boolean;
  backButtonHref?: string;
  rootPath?: string;
};

const mobileNavigationBottomItems: NavigationItemType[] = [
  {
    name: 'Budgets',
    href: '/app/budgets',
    icon: (props) => <CgCalculator {...props} />,
  },
  {
    name: 'Transactions',
    href: '/app/transactions',
    icon: (props) => <CgArrowsExchange {...props} />,
  },
  {
    name: 'Accounts',
    href: '/app/wallets',
    icon: (props) => <BsWallet {...props} />,
  },
];

function WalletCTA() {
  const [_, setIsOpen] = drawerAccountFormIsOpen;
  return (
    <Button variant="outline" color="primary" onClick={() => setIsOpen(true)}>
      <RiSystemAddFill />
      Add account
    </Button>
  );
}

function TransactionsCTA() {
  const [_, setIsOpen] = drawerTransactionFormIsOpen;
  return (
    <Button variant="outline" color="primary" onClick={() => setIsOpen(true)}>
      <RiSystemAddFill />
      Add transaction
    </Button>
  );
}

function BudgetsCTA() {
  const [_, setIsOpen] = drawerBudgetFormIsOpen;
  return (
    <Button variant="outline" color="primary" onClick={() => setIsOpen(true)}>
      <RiSystemAddFill />
      Add budget
    </Button>
  );
}

const headingItems: HeadingItemType[] = [
  {
    title: 'Wallets',
    rootPath: '/app/wallets',
    CTA: <WalletCTA />,
    showBackButton: false,
  },
  {
    title: 'Transactions',
    rootPath: '/app/transactions',
    CTA: <TransactionsCTA />,
    showBackButton: false,
  },
  {
    title: 'Budgets',
    rootPath: '/app/budgets',
    CTA: <BudgetsCTA />,
    showBackButton: false,
  },
];

function SideBarContainer() {
  return <SideBar />;
}

const MobileNavigationItem = (props: { item: NavigationItemType }) => {
  const { item } = props;

  return (
    <A
      href={item.href}
      class="[&[aria-current='page']]:text-emphasis hover:text-default text-muted relative my-2 min-w-0 flex-1 overflow-hidden rounded-md !bg-transparent p-1 text-center text-xs font-medium focus:z-10 sm:text-sm"
      // aria-current={current ? 'page' : undefined}
    >
      {item.icon && (
        <item.icon
          class="[&[aria-current='page']]:text-emphasis  mx-auto mb-1 block h-5 w-5 flex-shrink-0 text-center text-inherit"
          aria-hidden="true"
          // aria-current={current ? 'page' : undefined}
        />
      )}
      {/* {isLocaleReady ? <span class="block truncate">{t(item.name)}</span> : <SkeletonText />} */}
      <span>{item.name}</span>
    </A>
  );
};

function MobileNavigationContainer() {
  return (
    <>
      <nav class={cx('pwa:pb-2.5 fixed bottom-0 z-30 flex w-full border border-t bg-white px-1 md:hidden')}>
        {mobileNavigationBottomItems.map((item) => (
          <MobileNavigationItem item={item} />
        ))}
      </nav>
      <div class="block pt-12 md:hidden" />
    </>
  );
}

function TopNav() {
  const [, { Form }] = createServerAction$((f: FormData, { request }) => logout(request));

  return (
    <>
      <nav class="border-subtle sticky top-0 z-40 flex w-full items-center justify-between border-b bg-white py-1.5 px-4 backdrop-blur-lg  md:hidden">
        <A href="/app/wallets">Simple Budget</A>
        <Form class="flex items-center gap-2 self-center">
          <Button variant={'secondary'}>
            <FiLogOut class="lg:hidden" />
          </Button>
        </Form>
      </nav>
    </>
  );
}

function TopNavContainer() {
  return <TopNav />;
}

export function ShellMain(props: { children: any }) {
  const location = useLocation();

  const currentHeading = createMemo(() => {
    const currentHeadingItem = headingItems.find((item) => item.rootPath?.startsWith(location.pathname));
    if (currentHeadingItem) {
      return currentHeadingItem;
    }
    return null;
  });

  return (
    <>
      <div class={cx('flex items-center px-4 md:mb-6 md:mt-0')}>
        {currentHeading()?.showBackButton && (
          <A color="minimal" aria-label="Go Back" class="hover:bg-default mr-2 flex-shrink-0 rounded-full p-2" href="/">
            <CgArrowLeft />
          </A>
        )}
        {currentHeading() !== null && (
          <header class={cx('flex w-full max-w-full items-center truncate')}>
            <div class={cx('w-full truncate ltr:mr-4 rtl:ml-4 md:block')}>
              {currentHeading()?.title && (
                <h3
                  class={cx(
                    'font-cal max-w-28 sm:max-w-72 md:max-w-80 text-emphasis inline truncate text-lg font-semibold tracking-wide sm:text-xl md:block xl:max-w-full',
                    'text-xl',
                  )}
                >
                  {currentHeading()?.title}
                </h3>
              )}
              {currentHeading()?.subtitle && (
                <p class="text-default hidden text-sm md:block">{currentHeading()?.subtitle}</p>
              )}
            </div>
            {currentHeading()?.CTA && (
              <div
                class={cx(
                  true
                    ? 'relative'
                    : 'pwa:bottom-24 fixed bottom-20 z-40 ltr:right-4 rtl:left-4 md:z-auto md:ltr:right-0 md:rtl:left-0',
                  'flex-shrink-0 md:relative md:bottom-auto md:right-auto',
                )}
              >
                {currentHeading()?.CTA}
              </div>
            )}
            {/* {props.actions && props.actions} */}
          </header>
        )}
      </div>
      <div>{props.children}</div>
    </>
  );
}

function MainContainer(props: { children: any }) {
  return (
    <main class="bg-default relative z-0 flex-1 focus:outline-none">
      {/* Only for md and smaller (tablet and phones) */}
      <TopNavContainer />
      <div class="max-w-full py-4 md:py-3">
        <ErrorBoundary>
          <ShellMain>{props.children}</ShellMain>
        </ErrorBoundary>
        {/* Only for md and smaller (tablet and phones) */}
        {<MobileNavigationContainer />}
      </div>
    </main>
  );
}

export default function UsersLayout() {
  return (
    <div class="flex min-h-screen flex-col" id="main-body">
      <div class="flex flex-1">
        <SideBarContainer />
        <div class="flex w-0 flex-1 flex-col">
          <MainContainer>
            <Outlet />
          </MainContainer>
        </div>
      </div>
    </div>
  );
}
