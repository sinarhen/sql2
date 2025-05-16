import Link from 'next/link';
import { RegisterForm } from './_components/register-form';
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from '@/components/page-header';

export default function Register() {
  return (
    <div className='my-auto top-0 bottom-0'>
      <div className="max-w-md w-100 inset-0 mx-auto space-y-8">
        <PageHeader>
          <PageHeaderTitle>
            Create a new account
          </PageHeaderTitle>
          <PageHeaderDescription>
            Or{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80">
              sign in to your existing account
            </Link>
          </PageHeaderDescription>
        </PageHeader>
        
        <RegisterForm />
      </div>
    </div>
  );
} 