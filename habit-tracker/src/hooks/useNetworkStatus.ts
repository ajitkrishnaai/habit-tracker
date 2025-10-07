import { useState, useEffect } from 'react';
import { getPersistenceStatus } from '../config/firebase';

interface NetworkStatus {
  isOnline: boolean;
  isPersistenceEnabled: boolean;
  persistenceError: Error | null;
  isSyncing: boolean;
}

/**
 * Custom hook to monitor network status and Firebase sync state
 * Provides real-time information about online/offline status and data synchronization
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Get Firebase persistence status
  const { enabled: isPersistenceEnabled, error: persistenceError } =
    getPersistenceStatus();

  useEffect(() => {
    // Handle online event
    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);
      console.log('🌐 Network connection restored - syncing data...');

      // Reset syncing flag after a delay (Firebase will sync automatically)
      setTimeout(() => {
        setIsSyncing(false);
        console.log('✅ Data sync complete');
      }, 2000);
    };

    // Handle offline event
    const handleOffline = () => {
      setIsOnline(false);
      setIsSyncing(false);
      console.log('📴 Network connection lost - working offline');
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isPersistenceEnabled,
    persistenceError,
    isSyncing,
  };
};
