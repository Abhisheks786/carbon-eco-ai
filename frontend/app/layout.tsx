import { Inter } from 'next/font/google';
import { AppProviders } from '@/components/app-providers';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'EcoTrack AI — Carbon Footprint Platform',
  description: 'Track, reduce, and offset your carbon footprint with AI-powered insights.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
