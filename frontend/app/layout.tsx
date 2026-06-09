'use client';

import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import Navigation from '@/components/navigation';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className={`${inter.className} bg-slate-900 text-white`}>
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
