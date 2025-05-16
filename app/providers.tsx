'use client';

import { SessionProvider } from 'next-auth/react';
import ObserverProvider from './_components/observer-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ObserverProvider>
        {children}
      </ObserverProvider>
    </SessionProvider>
  );
} 