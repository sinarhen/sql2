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
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
} 