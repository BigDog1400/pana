import { Outlet } from 'solid-start';
import SideBar from '~/components/side-bar';

export default function UsersLayout() {
  return (
    <div class="leading-normal tracking-normal" id="main-body">
      <div class="flex flex-wrap">
        <SideBar />

        {/* :class="sideBarOpen ? 'overlay' : ''" id="main-content" */}
        <div class="w-full bg-gray-50 pl-0 lg:pl-64 min-h-screen">
          <div class=" bg-gray-50 ">
            <Outlet />
          </div>

          {/* <Footer /> */}
        </div>
      </div>
    </div>
  );
}
