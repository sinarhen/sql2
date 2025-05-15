'use client';

import { SessionProvider } from 'next-auth/react';
import ObserverProvider from './components/ObserverProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ObserverProvider>
        {children}
      </ObserverProvider>
    </SessionProvider>
  );
} 