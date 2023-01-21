// import { redirect } from 'solid-start/server';
// import { createCookieSessionStorage } from 'solid-start/session';
import PocketBase from 'pocketbase';
import { createCookieSessionStorage, redirect } from 'solid-start';

// type LoginForm = {
//   email: string;
//   password: string;
// };

// export async function register({ email, password }: LoginForm) {

//   return user;
// }

// export async function login({ email, password }: LoginForm) {
//   const user = await pb.collection('users').authWithPassword(email, password);
//   if (!user) return null;

//   return user;
// }

// // const sessionSecret = import.meta.env.SESSION_SECRET;

export const cookieSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'session',
    // secure doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: true,
    secrets: ['hello'],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

// export function getUserSession(request: Request) {
//   return storage.getSession(request.headers.get('Cookie'));
// }

// export async function getUserId(request: Request) {
//   const session = await getUserSession(request);
//   const userId = session.get('userId');
//   if (!userId || typeof userId !== 'string') return null;
//   return userId;
// }

// export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
//   const session = await getUserSession(request);
//   const userId = session.get('userId');
//   if (!userId || typeof userId !== 'string') {
//     const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
//     throw redirect(`/login?${searchParams}`);
//   }
//   return userId;
// }

// export async function getUser(request: Request) {
//   const userId = await getUserId(request);
//   if (typeof userId !== 'string') {
//     return null;
//   }

//   try {
//     const user = await pb.user.findUnique({ where: { id: Number(userId) } });
//     return user;
//   } catch {
//     throw logout(request);
//   }
// }

export async function logout(request: Request) {
  //   const session = await storage.getSession(request.headers.get('Cookie'));

  const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
  pb.authStore.loadFromCookie(request.headers.get('Cookie') || '');

  pb.authStore.clear();

  const exportCookie = pb.authStore.exportToCookie();

  return redirect('/login', {
    headers: {
      'Set-Cookie': pb.authStore.exportToCookie(),
    },
  });
}

// export async function createUserSession(userId: string, redirectTo: string) {
//   return redirect(redirectTo, {
//     headers: {
//       'Set-Cookie': pb.authStore.exportToCookie(),
//     },
//   });
// }
