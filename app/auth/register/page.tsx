import Link from 'next/link';
import { RegisterForm } from './_components/register-form';

export default function Register() {
  return (
    <div className='my-auto top-0 bottom-0'>
      <div className="max-w-md inset-0 mx-auto w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  );
} 