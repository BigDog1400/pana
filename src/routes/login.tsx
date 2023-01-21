import PocketBase from 'pocketbase';
import { Show } from 'solid-js';
import { A, useParams, useRouteData } from 'solid-start';
import { createServerData$, redirect } from 'solid-start/server';

import Counter from '~/components/Counter';
import { LoginForm } from '~/components/login-form';

export function routeData() {
  return createServerData$(async (_, { request }) => {
    const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
    pb.authStore.loadFromCookie(request.headers.get('Cookie') || '');
    if (pb.authStore.isValid) {
      throw redirect('/');
    } else {
      return null;
    }
  });
}

export default function Home() {
  const data = useRouteData<typeof routeData>();

  const params = useParams();

  return (
    <main class="">
      <LoginForm />
    </main>
  );
}
