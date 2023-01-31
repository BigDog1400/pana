// @refresh reload
import { Suspense } from 'solid-js';
import {
  useLocation,
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
  useRouteData,
} from 'solid-start';
import PocketBase from 'pocketbase';
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
          <ErrorBoundary>
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
