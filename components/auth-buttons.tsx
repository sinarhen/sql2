'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AuthButtons() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <div className="h-8 w-20 bg-muted animate-pulse rounded-xl"></div>;
  }

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-avatar.jpg" alt={session.user.name || ''} />
              <AvatarFallback>{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {session.user.name && <p className="font-medium text-xs">{session.user.name}</p>}
              {session.user.email && (
                <p className="w-[200px] truncate text-[10px] text-muted-foreground">
                  {session.user.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="w-full cursor-pointer text-xs">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="w-full cursor-pointer text-xs">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-xs"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link href="/auth/login">
        <Button variant="outline" size="sm" className="rounded-xl text-xs">
          Log in
        </Button>
      </Link>
      <Link href="/auth/register">
        <Button size="sm" className="rounded-xl text-xs">
          Sign up
        </Button>
      </Link>
    </div>
  );
} 