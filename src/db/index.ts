import PocketBase from 'pocketbase';

export async function initPocketBase(req: Request, res?: Response) {
  const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

  // load the store data from the request cookie string
  pb.authStore.loadFromCookie(req.headers.get('Cookie') || '');

  // send back the default 'pb_auth' cookie to the client with the latest store state
  // pb.authStore.onChange(() => {
  //   res.headers.set('Set-cookie', pb.authStore.exportToCookie());
  //   //   res?.setHeader('set-cookie', pb.authStore.exportToCookie());
  // });

  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    pb.authStore.isValid && (await pb.collection('users').authRefresh());
  } catch (_) {
    // clear the auth store on failed refresh
    pb.authStore.clear();
  }

  return pb;
}
