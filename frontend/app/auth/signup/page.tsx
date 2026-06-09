'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ParticleBackground from '@/components/auth/particle-background';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-context';
import {
  registerWithEmail,
  registerWithGoogle,
  getAuthErrorMessage,
} from '@/lib/auth-service';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function SignUp() {
  const router = useRouter();
  const { showToast } = useToast();
  const { setDevSession } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const firebaseUser = await registerWithEmail(
        formData.email,
        formData.password,
        formData.name
      );

      if (!firebaseUser && !isFirebaseConfigured()) {
        setDevSession({ email: formData.email, name: formData.name });
      }

      showToast('Account created successfully!', 'success');
      router.push('/dashboard');
    } catch (err) {
      showToast(getAuthErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await registerWithGoogle();
      showToast('Welcome to EcoTrack AI!', 'success');
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
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[420px]"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-1.5">
            Create your account
          </h1>
          <p className="text-slate-400 text-sm">
            Join the sustainable revolution
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/20">
          <form onSubmit={handleSignUp} className="space-y-4">
            <InputField label="Full Name" name="name" type="text" placeholder="Jane Doe" value={formData.name} onChange={handleChange} required />
            <InputField label="Email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
            <InputField label="Password" name="password" type="password" placeholder="At least 6 characters" value={formData.password} onChange={handleChange} required />
            <InputField label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat password" value={formData.confirmPassword} onChange={handleChange} required />

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white rounded-xl font-medium text-sm shadow-lg shadow-emerald-500/20"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-slate-500 text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full h-11 flex items-center justify-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl text-sm font-medium text-white"
          >
            Sign up with Google
          </button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function InputField({
  label, name, type, placeholder, value, onChange, required,
}: {
  label: string; name: string; type: string; placeholder: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-slate-300 text-sm font-medium mb-1.5 block">{label}</span>
      <input
        type={type} name={name} placeholder={placeholder} value={value}
        onChange={onChange} required={required}
        className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
      />
    </label>
  );
}
