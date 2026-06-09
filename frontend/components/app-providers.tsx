'use client';

import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/ui/toast';
import Navigation from '@/components/navigation';
import { usePathname } from 'next/navigation';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  return (
    <ToastProvider>
      <AuthProvider>
        {!isAuthPage && <Navigation />}
        <main className="min-h-screen">{children}</main>
      </AuthProvider>
    </ToastProvider>
  );
}
