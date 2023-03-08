import PocketBase from 'pocketbase';
import { Show } from 'solid-js';
import { A, useParams, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, redirect } from 'solid-start/server';

import Counter from '~/components/Counter';
import { logout } from '~/db/session';

export function routeData() {
  return createServerData$(async (_, { request }) => {
    const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
    pb.authStore.loadFromCookie(request.headers.get('Cookie') || '');
    if (pb.authStore.isValid) {
      return redirect('/app/wallets');
    } else {
      throw redirect('/login');
    }
  });
}

export default function Home() {
  const user = useRouteData<typeof routeData>();
  const [, { Form }] = createServerAction$((f: FormData, { request }) => logout(request));

  return (
    <main class="">
      <Form>
        <button name="logout" type="submit">
          Logout
        </button>
      </Form>
      <Counter />
    </main>
  );
}
