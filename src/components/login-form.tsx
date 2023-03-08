import PocketBase, { ClientResponseError } from 'pocketbase';
import { Show } from 'solid-js';
import { FormError } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { cookieSessionStorage } from '~/db/session';
// import { createUserSession, login, register } from '~/db/session';
import styles from './style.css';

function validateUsername(email: unknown) {
  if (typeof email !== 'string') {
    return `Please enter a valid email address`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== 'string' || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

export function LoginForm() {
  const [loggingIn, { Form }] = createServerAction$(async (form: FormData) => {
    const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
    const loginType = form.get('loginType');
    const email = form.get('email');
    const password = form.get('password');
    const redirectTo = form.get('redirectTo') || '/';

    if (
      typeof loginType !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof redirectTo !== 'string'
    ) {
      throw new FormError(`Form not submitted correctly.`);
    }

    const fields = { loginType, email, password };
    const fieldErrors = {
      email: validateUsername(email),
      password: validatePassword(password),
    };
    if (Object.values(fieldErrors).some(Boolean)) {
      throw new FormError('Fields invalid', { fieldErrors, fields });
    }

    switch (loginType) {
      case 'login': {
        try {
          const user = await pb.collection('users').authWithPassword(email, password);

          if (!user) {
            throw new FormError(`Username/Password combination is incorrect`, {
              fields,
            });
          }

          return redirect(redirectTo, {
            headers: {
              'Set-Cookie': pb.authStore.exportToCookie(),
            },
          });
        } catch (error) {
          if (error instanceof ClientResponseError) {
            throw new FormError(error.data.message || `Username/Password combination is incorrect`, {
              fields,
            });
          } else {
            throw new FormError(`Something went wrong trying to log in.`, {
              fields,
            });
          }
        }
      }
      case 'register': {
        // Attempt to create a new user with the given email and password
        try {
          const user = await pb.collection('users').create({
            email: email,
            password: password,
            passwordConfirm: password,
            emailVisibility: true,
          });

          if (!user) {
            // Throw an error
            throw new FormError(`Something went wrong trying to create a new user.`, {
              fields,
            });
          }

          await pb.collection('users').authWithPassword(email, password);

          // If the user was successfully created, redirect to the specified location and set the auth cookie
          return redirect(redirectTo, {
            headers: {
              'Set-Cookie': pb.authStore.exportToCookie(),
            },
          });
        } catch (error) {
          // If there was an error, throw an error
          if (error instanceof ClientResponseError) {
            throw new FormError(error.data.message || `Something went wrong trying to create a new user.`, {
              fields,
            });
          } else {
            throw new FormError(`Something went wrong trying to create a new user.`, {
              fields,
            });
          }
        }
      }
      default: {
        throw new FormError(`Login type invalid`, { fields });
      }
    }
  });
  return (
    <div class="LoginForm flex h-screen w-screen items-center justify-center">
      <Form class="flex w-full flex-col items-center md:w-[420px] ">
        <input type="hidden" name="redirectTo" value="/" />
        <div class="mb-6 w-full">
          <fieldset class={`flex w-full flex-row items-center justify-center gap-x-1 `}>
            <input type="radio" id="login" name="loginType" class="hidden" value="login" checked />
            <label class="text-center text-2xl font-bold text-black " for="login">
              Login
            </label>
            <input type="radio" name="loginType" value="register" id="register" class="hidden" />
            <label class="text-center text-2xl font-bold text-black " for="register">
              Register
            </label>
          </fieldset>
        </div>

        <div class="mb-6 w-full">
          <input
            type="email"
            name="email"
            id="email"
            class="w-full rounded bg-slate-200 py-4 px-8 outline-blue-500 placeholder:font-semibold hover:ring-1"
            placeholder="Email"
            required
          />
        </div>

        <div class="mb-6 w-full">
          <input
            type="password"
            name="password"
            id="password"
            class="w-full rounded bg-slate-200 py-4 px-8 outline-blue-500 placeholder:font-semibold hover:ring-1 "
            placeholder="Password"
            required
            min={6}
          />
        </div>

        <div class="flex w-full flex-row justify-between">
          <div class=" flex items-center gap-x-1">
            <input type="checkbox" name="remember" id="" class=" h-4 w-4  " />
            <label for="" class="text-sm text-slate-400">
              Remember me
            </label>
          </div>
          <div>
            <a href="#" class="text-sm text-slate-400 hover:text-blue-500">
              Forgot?
            </a>
          </div>
        </div>
        <Show when={loggingIn.error}>
          <p role="alert" class="mt-2 text-sm font-semibold text-red-500">
            {loggingIn.error.message}
          </p>
        </Show>

        <div class="mt-4 w-full">
          <button type="submit" class="w-full rounded bg-black py-4 font-bold text-blue-50  hover:bg-opacity-90">
            {' '}
            Continuar
          </button>
        </div>
      </Form>
    </div>
  );
}
