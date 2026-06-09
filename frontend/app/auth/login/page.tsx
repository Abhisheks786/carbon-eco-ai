'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ParticleBackground from '@/components/auth/particle-background';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-context';
import {
  authenticateWithEmail,
  authenticateWithGoogle,
  getAuthErrorMessage,
} from '@/lib/auth-service';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function LogIn() {
  const router = useRouter();
  const { showToast } = useToast();
  const { setDevSession } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const firebaseUser = await authenticateWithEmail(
        formData.email,
        formData.password
      );

      if (!firebaseUser && !isFirebaseConfigured()) {
        setDevSession({ email: formData.email, name: formData.email.split('@')[0] });
      }

      showToast('Welcome back!', 'success');
      router.push('/dashboard');
    } catch (err) {
      showToast(getAuthErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authenticateWithGoogle();
      showToast('Signed in with Google', 'success');
      router.push('/dashboard');
    } catch (err) {
      showToast(getAuthErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6">
      <ParticleBackground />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[420px]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4"
          >
            <span className="text-2xl" role="img" aria-label="Earth">
              🌍
            </span>
          </motion.div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-1.5">
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm">
            Sign in to your EcoTrack AI account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/20">
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full h-11 mt-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-emerald-500/20"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-slate-500 text-xs uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.01 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className="w-full h-11 flex items-center justify-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl text-sm font-medium text-white transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>

          <div className="mt-6 space-y-2 text-center text-sm">
            <p className="text-slate-500">
              <Link
                href="/auth/forgot-password"
                className="text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Forgot password?
              </Link>
            </p>
            <p className="text-slate-500">
              No account?{' '}
              <Link
                href="/auth/signup"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

        {!isFirebaseConfigured() && (
          <p className="mt-4 text-center text-xs text-slate-600">
            Dev mode — Firebase not configured. Backend auth is active.
          </p>
        )}
      </motion.div>
    </div>
  );
}

function InputField({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-slate-300 text-sm font-medium mb-1.5 block">
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
