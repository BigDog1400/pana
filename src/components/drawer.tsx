import { cx } from 'cva';
import {
  // import {
  Dialog,
  Transition,
  TransitionChild,
  DialogOverlay,
} from 'solid-headless';
import { createEffect, onCleanup, onMount } from 'solid-js';
import type { JSX } from 'solid-js/jsx-runtime';
type DrawerProps = {
  children: JSX.Element;
  isOpen: boolean;
  onToggle: () => void;
  class?: string;
};

function Drawer(props: DrawerProps) {
  createEffect(() => {
    if (props.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  });
  onCleanup(() => {
    // Remove the overflow hidden to the body
    document.body.style.overflow = '';
  });

  return (
    <Transition appear show={props.isOpen}>
      <Dialog isOpen class={`fixed right-0 top-0 z-50 overflow-y-auto ${props.class ?? ''}`} onClose={props.onToggle}>
        {props.children}
      </Dialog>
    </Transition>
  );
}

function DrawerOverlay() {
  return (
    <TransitionChild
      enter="transition-opacity ease-in duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-10"
      entered="opacity-10"
      leave="transition-opacity ease-out duration-300"
      leaveFrom="opacity-10"
      leaveTo="opacity-0"
    >
      <DialogOverlay class="fixed inset-0 z-[60] bg-black" />
    </TransitionChild>
  );
}

function DrawerContent(props: { children: JSX.Element; class?: string }) {
  return (
    <TransitionChild
      enter="transition ease-in-out duration-300 transform"
      enterFrom="translate-x-full"
      enterTo="-translate-x-0"
      leave="transition ease-in-out duration-300 transform"
      leaveFrom="-translate-x-0"
      leaveTo="translate-x-full"
    >
      <div
        class={cx(
          `relative z-[100] flex h-screen w-full flex-col justify-between overflow-auto bg-white p-6 text-left align-middle shadow-xl`,
          props.class,
        )}
      >
        {props.children}
      </div>
    </TransitionChild>
  );
}

function DrawerHeader(props: { children: JSX.Element; class?: string }) {
  return <div class={props.class}>{props.children}</div>;
}

function DrawerTitle(props: { children: JSX.Element }) {
  return <h1 class="inline-flex items-center text-base font-semibold  text-black ">{props.children}</h1>;
}

function DrawerDescription(props: { children: JSX.Element }) {
  return <p class="mt-2 max-w-lg text-sm text-gray-900 md:text-base">{props.children}</p>;
}

function DrawerBody(props: { children: JSX.Element }) {
  return <div class="flex-1">{props.children}</div>;
}

function DrawerFooter(props: { children: JSX.Element }) {
  return <div class="mt-10">{props.children}</div>;
}

export { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerTitle, DrawerDescription };
