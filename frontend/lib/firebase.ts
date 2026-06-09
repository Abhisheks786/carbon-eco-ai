import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const PLACEHOLDER_PATTERNS = [
  'your_firebase_api_key',
  'your-project',
  'your-firebase-project-id',
  'your-sender-id',
  'your-app-id',
];

export function isFirebaseConfigured(): boolean {
  const { apiKey, authDomain, projectId } = firebaseConfig;
  if (!apiKey || !authDomain || !projectId) return false;
  const values = [apiKey, authDomain, projectId].join(' ').toLowerCase();
  return !PLACEHOLDER_PATTERNS.some((p) => values.includes(p));
}

export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
