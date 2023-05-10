import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle,
} from '~/components/drawer';
import { Button } from '~/modules/ui/components/button';
import { AiOutlineClose } from 'solid-icons/ai';
import { CgArrowsExchange } from 'solid-icons/cg';
import { CgCalculator } from 'solid-icons/cg';
import { BsWallet } from 'solid-icons/bs';
import { A } from 'solid-start';

interface Props {
  className?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function DrawerMenu(props: Props) {
  return (
    <Drawer isOpen={props.isOpen} onToggle={props.onToggle} class="w-full max-w-xl">
      <DrawerOverlay />
      <DrawerContent class="p-0">
        <DrawerHeader class="flex items-center gap-2 px-6 py-2">
          <DrawerTitle>
            <span class="text-2xl font-semibold">SimpleBudget</span>
          </DrawerTitle>
          {/* X button */}
          <Button variant="outline" onClick={props.onToggle} class="ml-auto">
            <AiOutlineClose />
          </Button>
        </DrawerHeader>
        <DrawerBody>
          <ul class="mt-2 flex flex-col border-t-2 border-black">
            <li class="flex h-16 items-center border-b-2 border-black">
              <A href="/app/budgets" class="flex  h-full w-full cursor-pointer items-center rounded-sm pl-4">
                <CgCalculator class="mr-4 h-6 w-6" />
                <span class="text-gray-700">Presupuesto</span>
              </A>
            </li>
            <li class="flex h-16 items-center border-b-2 border-black">
              <A href="/app/transactions" class="flex  h-full w-full cursor-pointer items-center rounded-sm pl-4">
                <CgArrowsExchange class="mr-4 h-6 w-6" />
                <span class="text-gray-700">Transactions</span>
              </A>
            </li>
            <li class="flex h-16 items-center border-b-2 border-black">
              <A href="/app/wallets" class="flex h-full w-full cursor-pointer items-center rounded-sm pl-4">
                <BsWallet class="mr-4 h-6 w-6" />
                <span class="text-gray-700">Accounts</span>
              </A>
            </li>
          </ul>
        </DrawerBody>

        <DrawerFooter>
          {/* font size */}
          <Button fw={'semibold'} width="full" variant={'secondary'} onClick={props.onToggle} class="mb-1 text-lg">
            Logout
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
