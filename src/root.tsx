// @refresh reload
import { Suspense } from 'solid-js';
import { useLocation, A, Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title } from 'solid-start';
import PocketBase, { ClientResponseError } from 'pocketbase';
import { createServerData$, json } from 'solid-start/server';
import './root.css';

export function routeData() {
  return createServerData$(async (_, { request }) => {
    const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
    pb.authStore.loadFromCookie(request.headers.get('Cookie') || '');
    console.log('This was called');
    return json({ headers: { 'Set-Cookie': pb.authStore.exportToCookie() } });
  });
}

export default function Root() {
  const location = useLocation();

  const active = (path: string) =>
    path == location.pathname ? 'border-sky-600' : 'border-transparent hover:border-sky-600';
  return (
    <Html lang="en">
      <Head>
        <Title>SolidStart - With TailwindCSS</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        {/* <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        ></link> */}
      </Head>
      <Body class="bg-white">
        <Suspense>
          <ErrorBoundary
            fallback={(e: Error) => (
              <main class="flex h-screen w-full flex-col items-center justify-center">
                <h1 class="text-5xl font-extrabold tracking-widest text-black">Oh no! An Error!</h1>
                {e instanceof ClientResponseError ? (
                  <>
                    <div class="mt-2 rounded px-2 text-center text-sm">URL:&nbsp;{e.url}</div>
                    <div class="mt-2 rounded px-2 text-center text-sm ">Status:&nbsp;{e.status}</div>
                    <div class="mt-2 rounded px-2 text-center text-sm">Message:&nbsp;{e.message}</div>
                  </>
                ) : (
                  <>
                    {e.name ? <div class="mt-2 rounded px-2 text-sm">{e.name}</div> : null}
                    {e.message ? <div class="mt-2 rounded px-2 text-sm">{e.message}</div> : null}
                  </>
                )}

                <A
                  href="/app/wallets"
                  class="mt-2 inline-flex min-h-[2.5rem] items-center justify-center gap-2 rounded-md border-2 border-black bg-transparent py-1 px-5 text-sm font-semibold text-black transition-all hover:bg-opacity-90"
                >
                  <span>Go home</span>
                </A>
              </main>
            )}
          >
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
