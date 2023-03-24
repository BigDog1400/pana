import { A, useRouteData } from 'solid-start';
import { AiOutlineFileProtect, AiOutlineLineChart } from 'solid-icons/ai';
import { SiTarget } from 'solid-icons/si';
import { TbReportAnalytics } from 'solid-icons/tb';
import { BiRegularCategoryAlt } from 'solid-icons/bi';
import { FaSolidHandshakeSimple } from 'solid-icons/fa';
export function routeData() {
  // return createServerData$(async (_, { request }) => {
  //   const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
  //   pb.authStore.loadFromCookie(request.headers.get('Cookie') || '');
  //   if (pb.authStore.isValid) {
  //     return redirect('/app/wallets');
  //   } else {
  //     throw redirect('/login');
  //   }
  // });
}

export default function Home() {
  const user = useRouteData<typeof routeData>();
  // const [, { Form }] = createServerAction$((f: FormData, { request }) => logout(request));

  return (
    <>
      <header>
        <nav class="border-gray-200 bg-white px-4 pt-3 pb-3 lg:px-6">
          <div class="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between">
            <a href="#" class="flex items-center">
              <span class="self-center  whitespace-nowrap text-xl font-semibold">SimpleBudget</span>
            </a>
          </div>
        </nav>
      </header>
      <main class="grow">
        <section class="bg-white  pb-4 lg:pt-20 lg:pb-2">
          <div class="mx-auto max-w-7xl px-4 lg:px-4 lg:text-center">
            <h1 class="mb-4 text-4xl font-bold tracking-tight text-gray-900 lg:mb-7 lg:text-center lg:text-6xl lg:font-extrabold lg:leading-none xl:px-36">
              Take control of your finances
            </h1>
            <p class="mb-10 text-lg font-normal text-gray-500 lg:text-center lg:text-xl xl:px-60">
              The Budget Tracker app is a powerful tool for anyone looking to take control of their finances. Track your
              income and expenses, set budgets, and view detailed reports on your spending habits. Get started today!
            </p>
            <div class="mb-8 flex flex-col md:flex-row lg:justify-center">
              <A
                href="/login"
                class="inline-flex min-h-[3rem] items-center justify-center gap-2 rounded border-2 border-black bg-transparent py-1 px-5 text-2xl font-semibold text-black transition-all hover:bg-opacity-90"
              >
                Get started
              </A>
            </div>
          </div>
        </section>
        <section class="bg-white ">
          <div class="mx-auto max-w-screen-xl px-4 pb-8 sm:py-10 lg:px-6">
            <div class="space-y-8 md:grid md:grid-cols-2 md:gap-12 md:space-y-0 lg:grid-cols-3">
              <div>
                <div class="bg-primary-100 mb-4 flex h-10 w-10 items-center justify-center rounded-full lg:h-12 lg:w-12">
                  <AiOutlineLineChart size={24} />
                </div>
                <h3 class="mb-2 text-xl font-bold">Track income and expenses</h3>
                <p class="text-gray-500">
                  Record all your income and expenses in one place, making it easy to keep track of your finances.
                </p>
              </div>
              <div>
                <div class="bg-primary-100 mb-4 flex h-10 w-10 items-center justify-center rounded-full lg:h-12 lg:w-12">
                  <SiTarget size={24} />
                </div>
                <h3 class="mb-2 text-xl font-bold">Set budgets</h3>
                <p class="text-gray-500">
                  Set monthly for various categories like food, entertainment, and transportation. Stay on track with
                  your spending goals.
                </p>
              </div>
              <div>
                <div class="bg-primary-100 mb-4 flex h-10 w-10 items-center justify-center rounded-full lg:h-12 lg:w-12">
                  <TbReportAnalytics size={24} />
                </div>
                <h3 class="mb-2 text-xl font-bold">Detailed reports</h3>
                <p class="text-gray-500">
                  View detailed reports on your spending habits, including charts and graphs that show how you're
                  spending your money.
                </p>
              </div>
              <div>
                <div class="bg-primary-100 mb-4 flex h-10 w-10 items-center justify-center rounded-full lg:h-12 lg:w-12">
                  <BiRegularCategoryAlt size={24} />
                </div>
                <h3 class="mb-2 text-xl font-bold">Personalized categories</h3>
                <p class="text-gray-500">Create your own categories to track spending on specific items or events.</p>
              </div>
              <div>
                <div class="bg-primary-100 mb-4 flex h-10 w-10 items-center justify-center rounded-full lg:h-12 lg:w-12">
                  <FaSolidHandshakeSimple size={24} />
                </div>
                <h3 class="mb-2 text-xl font-bold">Easy to use</h3>
                <p class="text-gray-500">
                  Simple and intuitive interface, making it easy for anyone to start using it right away.
                </p>
              </div>
              <div>
                <div class="bg-primary-100 mb-4 flex h-10 w-10 items-center justify-center rounded-full lg:h-12 lg:w-12">
                  <AiOutlineFileProtect size={24} />
                </div>
                <h3 class="mb-2 text-xl font-bold">Secure</h3>
                <p class="text-gray-500">
                  All data is stored securely in the cloud, so you can access your information from anywhere while
                  keeping it safe and secure.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
