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
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function AuthButtons() {
  const { data: session, status, update } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  
  if (status === 'loading' || isUpdating) {
    return <div className="h-8 w-20 bg-muted animate-pulse rounded-xl"></div>;
  }

  const toggleRole = async () => {
    if (!session) return;
    
    const newRole = session.user.role === 'student' ? 'lecturer' : 'student';
    setIsUpdating(true);
    
    try {
      await update({ 
        ...session,
        user: { 
          ...session.user, 
          role: newRole 
        }
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
              <p className="text-[10px] text-muted-foreground">
                Role: {session.user.role}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 flex items-center gap-2">
            <Switch 
              id="role-toggle" 
              checked={session.user.role === 'lecturer'}
              onCheckedChange={toggleRole}
            />
            <Label htmlFor="role-toggle" className="text-xs cursor-pointer">
              {session.user.role === 'student' ? 'Switch to Lecturer' : 'Switch to Student'}
            </Label>
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
        <Button variant="outline" size="sm">
          Log in
        </Button>
      </Link>
      <Link href="/auth/register">
        <Button size="sm" >
          Sign up
        </Button>
      </Link>
    </div>
  );
} 