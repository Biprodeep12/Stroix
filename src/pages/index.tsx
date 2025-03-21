import Ai from '@/components/ai';
import Side from '@/components/sidebar';

export default function Home() {
  return (
    <div className='w-screen min-h-screen grid grid-cols-[3%_97%]'>
      <Side />
      <Ai />
    </div>
  );
}
