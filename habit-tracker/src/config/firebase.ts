import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration object
// These values should be replaced with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable offline persistence functions (available for future use)
// import { enableNetwork, disableNetwork } from 'firebase/firestore';

// Enable offline persistence for Firestore
if (typeof window !== 'undefined') {
  // Only run in browser environment
  import('firebase/firestore').then(
    ({ enableMultiTabIndexedDbPersistence }) => {
      enableMultiTabIndexedDbPersistence(db).catch(err => {
        if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one tab at a time
          console.warn('Firebase persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          // The current browser doesn't support persistence
          console.warn('Firebase persistence failed: Browser not supported');
        }
      });
    }
  );
}

// Development emulator connection (optional)
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'
) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    console.warn('Firebase emulator connection failed:', error);
  }
}

export default app;
