// Test-specific Firebase configuration that uses process.env instead of import.meta
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'test-api-key',
  authDomain:
    process.env.VITE_FIREBASE_AUTH_DOMAIN || 'test-project.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'test-project',
  storageBucket:
    process.env.VITE_FIREBASE_STORAGE_BUCKET || 'test-project.appspot.com',
  messagingSenderId:
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.VITE_FIREBASE_APP_ID || 'test-app-id',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
