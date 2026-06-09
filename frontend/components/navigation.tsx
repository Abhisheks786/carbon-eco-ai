import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="p-4 bg-slate-800 text-white flex gap-4 items-center">
      <Link href="/dashboard" className="text-xl font-bold text-emerald-500 mr-4">EcoTrack AI</Link>
      <Link href="/dashboard" className="hover:text-emerald-400">Dashboard</Link>
      <Link href="/calculator" className="hover:text-emerald-400">Calculator</Link>
      <Link href="/community" className="hover:text-emerald-400">Community</Link>
      <Link href="/carbon-twin" className="hover:text-emerald-400">Carbon Twin</Link>
      <Link href="/auth/login" className="hover:text-emerald-400 ml-auto">Login</Link>
    </nav>
  );
}
