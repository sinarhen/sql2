import Link from 'next/link';
import { AuthButtons } from './auth-buttons';
// Uncomment when needed
// import { Avatar, AvatarFallback, AvatarImage } from '../src/components/ui/avatar';

export function Navbar() {
  return (
    <header className="border-b px-40 fixed z-50 bg-white/10 backdrop-blur-sm w-full border-border/10">
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
          <AuthButtons />
        </div>
      </div>
    </header>
  );
} 