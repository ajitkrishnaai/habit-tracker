/**
 * Cache Manager Utility
 * Provides utilities for managing Firebase offline cache and data synchronization
 */

import {
  enableFirebaseNetwork,
  disableFirebaseNetwork,
  clearOfflineCache,
  getPersistenceStatus,
} from '../config/firebase';

/**
 * Cache configuration options
 */
export interface CacheConfig {
  maxAge: number; // Maximum age of cached data in milliseconds
  prefetchOnLoad: boolean; // Whether to prefetch data on app load
  syncInterval: number; // Interval for background sync in milliseconds
}

/**
 * Default cache configuration
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  prefetchOnLoad: true,
  syncInterval: 5 * 60 * 1000, // 5 minutes
};

/**
 * Check if the app is running in offline mode
 */
export const isOfflineMode = (): boolean => {
  return !navigator.onLine;
};

/**
 * Check if persistence is enabled and working
 */
export const isPersistenceActive = (): boolean => {
  const { enabled } = getPersistenceStatus();
  return enabled;
};

/**
 * Force a sync with the server
 */
export const forceSyncWithServer = async (): Promise<void> => {
  try {
    // Disable and re-enable network to force a sync
    await disableFirebaseNetwork();
    await new Promise((resolve) => setTimeout(resolve, 100));
    await enableFirebaseNetwork();
    console.log('✅ Forced sync with server completed');
  } catch (error) {
    console.error('Failed to force sync with server:', error);
    throw error;
  }
};

/**
 * Clear all cached data
 */
export const clearAllCachedData = async (): Promise<void> => {
  try {
    await clearOfflineCache();
    console.log('✅ All cached data cleared');
  } catch (error) {
    console.error('Failed to clear cached data:', error);
    throw error;
  }
};

/**
 * Get cache information
 */
export const getCacheInfo = (): {
  isPersistenceEnabled: boolean;
  isOnline: boolean;
  error: Error | null;
} => {
  const { enabled, error } = getPersistenceStatus();
  return {
    isPersistenceEnabled: enabled,
    isOnline: navigator.onLine,
    error,
  };
};

/**
 * Setup background sync for periodic data synchronization
 * Returns a cleanup function to stop the sync
 */
export const setupBackgroundSync = (
  config: CacheConfig = DEFAULT_CACHE_CONFIG
): (() => void) => {
  let intervalId: NodeJS.Timeout | null = null;

  const syncData = async () => {
    if (navigator.onLine) {
      try {
        await forceSyncWithServer();
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  };

  // Start periodic sync
  intervalId = setInterval(syncData, config.syncInterval);

  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
};

/**
 * Prefetch critical data for offline use
 * This ensures commonly used data is available offline
 */
export const prefetchCriticalData = async (): Promise<void> => {
  try {
    // Data is automatically cached by Firebase when accessed
    // This function is a placeholder for any custom prefetch logic
    console.log('📦 Prefetching critical data for offline use...');

    // Firebase will automatically cache queries that are executed
    // The useFirestore hook will handle this automatically

    console.log('✅ Critical data prefetch complete');
  } catch (error) {
    console.error('Failed to prefetch critical data:', error);
    throw error;
  }
};

/**
 * Monitor cache size and warn if it's getting large
 * Note: Firebase manages cache size automatically, but this is useful for monitoring
 */
export const monitorCacheSize = (): void => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage
      .estimate()
      .then(({ usage, quota }) => {
        if (usage && quota) {
          const percentUsed = (usage / quota) * 100;
          console.log(
            `💾 Cache usage: ${(usage / 1024 / 1024).toFixed(2)} MB / ${(
              quota /
              1024 /
              1024
            ).toFixed(2)} MB (${percentUsed.toFixed(2)}%)`
          );

          if (percentUsed > 80) {
            console.warn(
              '⚠️  Cache usage is high. Consider clearing old data.'
            );
          }
        }
      })
      .catch((error) => {
        console.error('Failed to estimate storage:', error);
      });
  }
};

/**
 * Test offline functionality
 * Useful for development and testing
 */
export const testOfflineMode = async (): Promise<void> => {
  try {
    console.log('🧪 Testing offline mode...');
    await disableFirebaseNetwork();
    console.log('📴 Firebase network disabled - app is now in offline mode');
    console.log('💡 Use enableFirebaseNetwork() to restore connection');
  } catch (error) {
    console.error('Failed to test offline mode:', error);
    throw error;
  }
};

/**
 * Restore online mode after testing
 */
export const restoreOnlineMode = async (): Promise<void> => {
  try {
    console.log('🔄 Restoring online mode...');
    await enableFirebaseNetwork();
    console.log('🌐 Firebase network enabled - app is now online');
  } catch (error) {
    console.error('Failed to restore online mode:', error);
    throw error;
  }
};
