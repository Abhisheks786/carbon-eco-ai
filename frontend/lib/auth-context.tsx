'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

interface DevUser {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  devUser: DevUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  setDevSession: (session: DevUser | null) => void;
}

const DEV_SESSION_KEY = 'ecotrack_dev_session';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [devUser, setDevUser] = useState<DevUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setDevSession = (session: DevUser | null) => {
    setDevUser(session);
    if (session) {
      localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(session));
      (window as any).__getAuthToken = async () => 'dev-mock-token';
    } else {
      localStorage.removeItem(DEV_SESSION_KEY);
      (window as any).__getAuthToken = null;
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured()) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          (window as any).__getAuthToken = async () =>
            await currentUser.getIdToken();
        } else {
          (window as any).__getAuthToken = null;
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }

    const stored = localStorage.getItem(DEV_SESSION_KEY);
    if (stored) {
      try {
        const session = JSON.parse(stored) as DevUser;
        setDevUser(session);
        (window as any).__getAuthToken = async () => 'dev-mock-token';
      } catch {
        localStorage.removeItem(DEV_SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const value = {
    user,
    devUser,
    loading,
    isAuthenticated: !!user || !!devUser,
    setDevSession,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useDisplayName(): string {
  const { user, devUser } = useAuth();
  return user?.displayName || devUser?.name || user?.email || devUser?.email || 'User';
}
