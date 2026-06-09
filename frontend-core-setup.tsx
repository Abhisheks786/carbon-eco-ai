// app/layout.tsx
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

// lib/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// lib/api.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await (window as any).__getAuthToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiClient = {
  // Auth
  signup: (email: string, password: string, name: string) =>
    api.post('/api/auth/signup', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data: any) => api.put('/api/auth/profile', data),

  // Calculator
  calculateFootprint: (data: any) =>
    api.post('/api/footprint/calculate', data),
  getHistory: () => api.get('/api/footprint/history'),
  getMonthlyData: (year: number, month: number) =>
    api.get(`/api/footprint/monthly/${year}/${month}`),

  // Dashboard
  getDashboard: () => api.get('/api/dashboard/overview'),
  getBreakdown: () => api.get('/api/dashboard/breakdown'),
  getRecommendations: () => api.get('/api/dashboard/recommendations'),

  // Community
  getLeaderboard: (limit = 50) =>
    api.get(`/api/community/leaderboard?limit=${limit}`),
  getCityRankings: (city: string) =>
    api.get(`/api/community/city-rankings/${city}`),
  getFriendScores: () => api.get('/api/community/friends'),

  // Achievements
  getUserAchievements: () => api.get('/api/achievements/user'),
  claimAchievement: (id: string) =>
    api.post(`/api/achievements/claim/${id}`),

  // Offsets
  createOffset: (data: any) =>
    api.post('/api/offsets/create', data),
  getOffsets: () => api.get('/api/offsets/my-offsets'),
};

// lib/utils.ts
export const formatCO2 = (value: number): string => {
  return `${value.toFixed(2)} kg CO₂`;
};

export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 1000) + 1;
};

export const getLevelName = (level: number): string => {
  const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  return levels[Math.min(level - 1, levels.length - 1)];
};

export const getEmissionColor = (value: number, max: number): string => {
  const percentage = (value / max) * 100;
  if (percentage < 33) return '#10b981'; // green
  if (percentage < 66) return '#f59e0b'; // amber
  return '#ef4444'; // red
};
