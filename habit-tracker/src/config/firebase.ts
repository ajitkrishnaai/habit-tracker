import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  enableMultiTabIndexedDbPersistence,
  enableNetwork,
  disableNetwork,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
} from 'firebase/firestore';
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

// Initialize Firestore with custom cache settings
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});

// Initialize Firebase Auth
export const auth = getAuth(app);

// Persistence state tracking
let isPersistenceEnabled = false;
let persistenceError: Error | null = null;

// Enable offline persistence for Firestore
if (typeof window !== 'undefined') {
  // Only run in browser environment
  enableMultiTabIndexedDbPersistence(db)
    .then(() => {
      isPersistenceEnabled = true;
      console.log('✅ Firebase offline persistence enabled');
    })
    .catch((err) => {
      persistenceError = err;
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn(
          '⚠️  Firebase persistence failed: Multiple tabs open. Only one tab can have persistence enabled at a time.'
        );
      } else if (err.code === 'unimplemented') {
        // The current browser doesn't support persistence
        console.warn(
          '⚠️  Firebase persistence failed: Browser does not support IndexedDB persistence.'
        );
      } else {
        console.error('❌ Firebase persistence failed:', err);
      }
    });
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

/**
 * Get persistence status
 */
export const getPersistenceStatus = (): {
  enabled: boolean;
  error: Error | null;
} => {
  return {
    enabled: isPersistenceEnabled,
    error: persistenceError,
  };
};

/**
 * Manually enable network (useful for testing or manual sync)
 */
export const enableFirebaseNetwork = async (): Promise<void> => {
  try {
    await enableNetwork(db);
    console.log('🌐 Firebase network enabled');
  } catch (error) {
    console.error('Failed to enable Firebase network:', error);
    throw error;
  }
};

/**
 * Manually disable network (useful for testing offline scenarios)
 */
export const disableFirebaseNetwork = async (): Promise<void> => {
  try {
    await disableNetwork(db);
    console.log('📴 Firebase network disabled');
  } catch (error) {
    console.error('Failed to disable Firebase network:', error);
    throw error;
  }
};

/**
 * Clear offline cache (useful for debugging or manual data refresh)
 * Note: This requires re-enabling persistence after clearing
 */
export const clearOfflineCache = async (): Promise<void> => {
  try {
    await disableNetwork(db);
    await enableNetwork(db);
    console.log('🗑️  Firebase offline cache cleared');
  } catch (error) {
    console.error('Failed to clear offline cache:', error);
    throw error;
  }
};

export default app;
