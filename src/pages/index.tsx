import Ai from '@/components/ai';
import Side from '@/components/sidebar';
import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [openSidebar, setOpenSiderbar] = useState(false);
  return (
    <div className='flex flex-row'>
      <div
        className='fixed top-0 p-1 mx-2 mt-1.5  cursor-pointer hover:bg-gray-300 z-90 rounded-sm'
        onClick={() => setOpenSiderbar(!openSidebar)}>
        {openSidebar ? (
          <PanelRightOpen className='' size={30} />
        ) : (
          <PanelLeftOpen className='' size={30} />
        )}
      </div>
      <Side openSidebar={openSidebar} />
      <Ai openSidebar={openSidebar} />
    </div>
  );
}
