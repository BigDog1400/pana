import NavBar from '~/components/nav-bar';
import { RiSystemAddFill } from 'solid-icons/ri';
import { createMemo, createSignal, createUniqueId, Show } from 'solid-js';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle,
} from '~/components/drawer';
import { DrawerAccountForm } from '~/components/drawer-account-form';

export default function Wallets() {
  const [isOpen, setIsOpen] = createSignal(false);
  return (
    <>
      <NavBar
        rightElement={
          // add wallet button

          <button
            class="text-black  px-5 py-1 border-black border-2 rounded-[3px]
            font-semibold
            bg-white
            inline-flex items-center
            gap-2
            text-sm
            h-10
            hover:bg-gray-100
            "
            onClick={() => setIsOpen(true)}
          >
            <RiSystemAddFill />
            Agregar Cartera
          </button>
        }
      />
      <div class="p-6 mb-20">
        <h1>Wallets</h1>
      </div>

      <DrawerAccountForm className="mt-10" isOpen={isOpen()} onToggle={() => setIsOpen(false)} />
    </>
  );
}
