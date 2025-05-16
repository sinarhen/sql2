import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserById } from '../dashboard/actions';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const user = await getUserById(session?.user?.id || "")
  if (user) {
    redirect('/dashboard');
  }
  
  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-4">
      <div>
      {session ? (
            <p className='text-center text-destructive'>
Your session is invalid or expired please login again
            </p>
      ) : null}
      {children}
      </div>
      
    </div>
  );
} 