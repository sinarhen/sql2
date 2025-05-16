'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { AuthButtons } from './auth-buttons';
// Uncomment when needed
// import { Avatar, AvatarFallback, AvatarImage } from '../src/components/ui/avatar';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'student';
  const isAuthenticated = !!session;

  return (
    <header className="border-b px-4 md:px-8 lg:px-20 fixed z-50 bg-white w-full border-border/10">
      <div className="container flex h-14 justify-between items-center">
        <div className="mr-4 flex">
          <Link href="/" className="font-medium flex items-center">
            <span className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-xs text-primary-foreground mr-2">LA</span>
            <span className="hidden  md:inline-block">Learnics</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
          <nav className="flex items-center space-x-3 text-xs overflow-x-auto">
            {!isAuthenticated ? (
              <>
                <Link href="/" className="text-foreground/60 hover:text-foreground transition-colors">
                  Home
                </Link>
                <Link href="/" className="text-foreground/60 hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="/" className="text-foreground/60 hover:text-foreground transition-colors">
                  About
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className={cn("text-foreground/60 hover:text-foreground transition-colors")}>
                  Dashboard
                </Link>
                {userRole === 'lecturer' || userRole === 'admin' ? (
                  <>
                    <Link href="/dashboard/courses" className="text-foreground/60 hover:text-foreground transition-colors">
                      Courses
                    </Link>
                    <Link href="/dashboard/assignments" className="text-foreground/60 hover:text-foreground transition-colors">
                      Assignments
                    </Link>
                    <Link href="/dashboard/forms" className="text-foreground/60 hover:text-foreground transition-colors">
                      Forms
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard/courses" className="text-foreground/60 hover:text-foreground transition-colors">
                      Courses
                    </Link>
                    <Link href="/dashboard/my-courses" className="text-foreground/60 hover:text-foreground transition-colors">
                      My Courses
                    </Link>
                    <Link href="/dashboard/assignments" className="text-foreground/60 hover:text-foreground transition-colors">
                      Assignments
                    </Link>
                    <Link href="/dashboard/forms" className="text-foreground/60 hover:text-foreground transition-colors">
                      Forms
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
          <AuthButtons />
        </div>
      </div>
    </header>
  );
} 