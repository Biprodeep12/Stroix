interface Props {
  openSidebar: boolean;
}

export default function Side({ openSidebar }: Props) {
  return (
    <>
      <div
        className={`border-2 border-[#ccc] overflow-hidden pt-15 transition-all duration-300 ease-in-out ${
          openSidebar ? 'w-[500px] opacity-100' : 'w-0 opacity-0'
        }`}>
        <section className=''>
          <h2>Notes</h2>
          <div></div>
        </section>
      </div>
    </>
  );
}
