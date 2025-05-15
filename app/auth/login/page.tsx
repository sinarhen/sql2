import Link from 'next/link';
import { LoginForm } from './_components/login-form';

export default function Login() {
  return (
    <div className='my-auto top-0 bottom-0'>
      <div className="max-w-md inset-0 mx-auto w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:text-primary/80">
              create a new account
            </Link>
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
} 