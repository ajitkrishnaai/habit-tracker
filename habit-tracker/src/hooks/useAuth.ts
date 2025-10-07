import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for Firebase Anonymous Authentication
 * Automatically signs in users anonymously and manages auth state
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state observer
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (currentUser) {
          // User is already signed in
          setUser(currentUser);
          setLoading(false);
          setError(null);
        } else {
          // No user signed in, sign in anonymously
          try {
            const userCredential = await signInAnonymously(auth);
            setUser(userCredential.user);
            setError(null);
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : 'Failed to authenticate';
            setError(errorMessage);
            console.error('Anonymous authentication error:', err);
          } finally {
            setLoading(false);
          }
        }
      },
      (err) => {
        // Auth state change error
        const errorMessage =
          err instanceof Error ? err.message : 'Auth state change error';
        setError(errorMessage);
        setLoading(false);
        console.error('Auth state change error:', err);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};
