import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { getUserById } from './actions';


export default async function Layout({ children }: { children: React.ReactNode }) {

  const session = await getServerSession();
  if (!session){
    redirect("/auth/login")
  }
  const user = getUserById(session.user.id)
  if (!user){
    redirect("/auth/login")
  }
  return (
    <main className="py-16 px-32 max-w-screen-2xl mt-[57px] w-full overflow-hidden">
      {children}
    </main>
  )
}
