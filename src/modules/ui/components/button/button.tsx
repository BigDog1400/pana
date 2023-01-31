import { cva, type VariantProps } from 'cva';
import { splitProps } from 'solid-js';
import type { JSX } from 'solid-js/jsx-runtime';
// ⚠️ Disclaimer: Use of Tailwind CSS is optional
const button = cva('rounded transition-all', {
  variants: {
    variant: {
      primary: [
        'bg-black',
        'text-white',
        'hover:bg-opacity-90',
        'disabled:bg-gray-200',
        'disabled:text-gray-400',
        'disabled:cursor-not-allowed',
      ],
      secondary: [
        'bg-white',
        'text-black',
        'hover:bg-opacity-90',
        'hover:bg-gray-100',
        'disabled:text-gray-400',
        'disabled:cursor-not-allowed',
      ],
      outline: ['bg-transparent', 'text-black', 'border-2', 'border-black', 'hover:bg-opacity-90'],
    },
    size: {
      medium: ['py-1', 'px-8', 'text-sm', 'min-h-[2.5rem]'],
    },
    width: {
      full: ['w-full'],
    },
    fw: {
      normal: ['font-normal'],
      semibold: ['font-semibold'],
      bold: ['font-bold'],
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
});

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {}

export function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, ['variant', 'size', 'width', 'fw', 'class']);

  return (
    <button
      class={button({ variant: local.variant, size: local.size, class: local.class, width: local.width, fw: local.fw })}
      {...others}
    />
  );
}
