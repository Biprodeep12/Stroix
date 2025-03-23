import { useState, useEffect } from 'react';

interface Props {
  openSidebar: boolean;
}

export default function Side({ openSidebar }: Props) {
  const [sidebarWidth, setSidebarWidth] = useState('w-[500px]');

  useEffect(() => {
    const updateSidebarWidth = () => {
      setSidebarWidth(window.innerWidth < 600 ? 'w-[50%]' : 'w-[500px]');
    };

    if (typeof window !== 'undefined') {
      updateSidebarWidth();
      window.addEventListener('resize', updateSidebarWidth);
    }

    return () => {
      window.removeEventListener('resize', updateSidebarWidth);
    };
  }, []);

  return (
    <>
      {openSidebar && (
        <div className='fixed bg-gray-100 opacity-60 w-full h-screen z-80'></div>
      )}
      <div
        className={`sid border-2 border-[#ccc] overflow-hidden pt-15 transition-all duration-300 ease-in-out h-screen ${
          openSidebar ? `${sidebarWidth} opacity-100` : 'w-0 opacity-0'
        }`}>
        <section>
          <h2>Notes</h2>
          <div>kar dadu</div>
        </section>
      </div>
    </>
  );
}
