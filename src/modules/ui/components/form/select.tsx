import type { JSX } from 'solid-js/jsx-runtime';
import { cn } from '~/modules/utils/cn';
interface SelectProps extends JSX.InputHTMLAttributes<HTMLSelectElement> {}
export function Select(props: SelectProps) {
  return (
    <select
      {...props}
      class={cn(
        'block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus-visible:outline-blue-500',
        props.class,
      )}
    >
      {props.children}
    </select>
  );
}
