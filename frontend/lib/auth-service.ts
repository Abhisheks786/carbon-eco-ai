'use client';

import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { apiClient } from '@/lib/api';

export async function authenticateWithEmail(email: string, password: string) {
  if (isFirebaseConfigured()) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    await apiClient.syncUser(idToken);
    return credential.user;
  }

  await apiClient.login(email, password);
  return null;
}

export async function authenticateWithGoogle() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Google sign-in requires Firebase configuration. Add your Firebase web credentials to .env.local.'
    );
  }

  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  await apiClient.syncUser(idToken, result.user.displayName || undefined);
  return result.user;
}

export async function registerWithEmail(
  email: string,
  password: string,
  name: string
) {
  if (isFirebaseConfigured()) {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    await apiClient.signup({ email, name, idToken });
    return credential.user;
  }

  await apiClient.signup({ email, password, name });
  return null;
}

export async function registerWithGoogle() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Google sign-up requires Firebase configuration. Add your Firebase web credentials to .env.local.'
    );
  }

  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  await apiClient.signup({
    email: result.user.email!,
    name: result.user.displayName || 'User',
    idToken,
  });
  return result.user;
}

export function getAuthErrorMessage(error: unknown): string {
  const err = error as { code?: string; message?: string };

  const firebaseMessages: Record<string, string> = {
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Check your connection and retry.',
  };

  if (err.code && firebaseMessages[err.code]) {
    return firebaseMessages[err.code];
  }

  if (err.message && !err.message.includes('status code')) {
    return err.message;
  }

  return 'Something went wrong. Please try again.';
}
