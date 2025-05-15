import Link from 'next/link';
import { Button } from '@/components/ui/button';
// Uncomment when needed
// import { Avatar, AvatarFallback, AvatarImage } from '../src/components/ui/avatar';

export function Navbar() {
  return (
    <header className="border-b px-40 border-border/10">
      <div className="container flex h-14 justify-between items-center">
        <div className="mr-4 flex">
          <Link href="/" className="font-medium flex items-center">
            <span className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-xs text-primary-foreground mr-2">LA</span>
            <span className="hidden md:inline-block">Learning Analytics</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-10 md:justify-end">
          <nav className="flex items-center space-x-4 text-xs">
            <Link href="/features" className="text-foreground/60 hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-foreground/60 hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-foreground/60 hover:text-foreground transition-colors">
              Documentation
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="outline" size="sm" className="rounded-xl text-xs">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-xl text-xs">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 