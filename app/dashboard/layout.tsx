import { redirect } from 'next/navigation';
import { getUserById } from './actions';
import { auth } from '../../lib/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session || !session.user){
    redirect("/auth/login");
  }
  
  const user = await getUserById(session.user.id);
  if (!user){
    redirect("/auth/login");
  }
  
  return (
    <main className="py-16 px-32 max-w-screen-2xl mt-[57px] w-full overflow-hidden">
      {children}
    </main>
  );
}
