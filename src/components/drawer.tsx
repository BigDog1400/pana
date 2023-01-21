import {
  // import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
  DialogOverlay,
  DialogDescription,
} from 'solid-headless';
import type { JSX } from 'solid-js/jsx-runtime';
type DrawerProps = {
  children: JSX.Element;
  isOpen: boolean;
  onToggle: () => void;
  class?: string;
};

function Drawer(props: DrawerProps) {
  return (
    <Transition appear show={props.isOpen}>
      <Dialog isOpen class={`fixed z-50 right-0 top-0 overflow-y-auto ${props.class ?? ''}`} onClose={props.onToggle}>
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
      <DialogOverlay class="z-[60] fixed inset-0 bg-black" />
    </TransitionChild>
  );
}

function DrawerContent(props: { children: JSX.Element }) {
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
        class={`flex flex-col justify-between bg-white w-full z-[100]  p-6 overflow-hidden text-left relative align-middle shadow-xl h-screen `}
      >
        {props.children}
      </div>
    </TransitionChild>
  );
}

function DrawerHeader(props: { children: JSX.Element }) {
  return <div>{props.children}</div>;
}

function DrawerTitle(props: { children: JSX.Element }) {
  return <h1 class="text-base md:text-xl font-semibold text-gray-700 uppercase">{props.children}</h1>;
}

function DrawerDescription(props: { children: JSX.Element }) {
  return <p class="max-w-lg text-sm md:text-base text-gray-700 mt-2">{props.children}</p>;
}

function DrawerBody(props: { children: JSX.Element }) {
  return <div class="flex-1">{props.children}</div>;
}

function DrawerFooter(props: { children: JSX.Element }) {
  return <div class="mt-10">{props.children}</div>;
}

export { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerTitle, DrawerDescription };
