import Link from 'next/link';
import { LoginForm } from './_components/login-form';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/page-header';
export default function Login() {
  return (
    <div className='my-auto top-0 bottom-0'>
      <div className="max-w-md inset-0 mx-auto w-100 space-y-8">
        <PageHeader>
          <PageHeaderTitle> 
            Sign in to your account
          </PageHeaderTitle>
          <PageHeaderDescription>
            Or{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:text-primary/80">
              create a new account
            </Link>
          </PageHeaderDescription>
        </PageHeader>
        
        <LoginForm />
      </div>
    </div>
  );
} 