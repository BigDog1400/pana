import type { JSX } from 'solid-js/jsx-runtime';
import { twMerge } from 'tailwind-merge';
import { cn } from '~/modules/utils/cn';
interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {}
export function Input(props: InputProps) {
  return (
    <input
      {...props}
      class={cn(
        'block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-blue-500 focus:ring-blue-500',
        props.class,
      )}
    />
  );
}
