import { StartServer, createHandler, renderAsync } from 'solid-start/entry-server';
import PocketBase from 'pocketbase';
import { redirect } from 'solid-start';

const protectedPathRegex = /^\/app\/.*/;

export default createHandler(
  ({ forward }) => {
    return async (event) => {
      const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
      pb.authStore.loadFromCookie(event.request.headers.get('Cookie') || '');
      try {
        pb.authStore.isValid && (await pb.collection('users').authRefresh());
      } catch (error) {
        pb.authStore.clear();
      }

      if (protectedPathRegex.test(new URL(event.request.url).pathname)) {
        if (pb.authStore.isValid) {
          return forward(event);
        } else {
          return redirect('/login', {
            headers: {
              'Set-Cookie': pb.authStore.exportToCookie(),
            },
          });
        }
      }

      return forward(event); // if we got here, and the pathname is inside the `protectedPaths` array - a user is logged in
    };
  },

  renderAsync((event) => <StartServer event={event} />),
);
