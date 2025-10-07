import React from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface NetworkStatusIndicatorProps {
  showWhenOnline?: boolean;
  className?: string;
}

/**
 * Component to display network status and sync state to users
 * Shows indicators for offline mode and data syncing
 */
export const NetworkStatusIndicator: React.FC<
  NetworkStatusIndicatorProps
> = ({ showWhenOnline = false, className = '' }) => {
  const { isOnline, isPersistenceEnabled, isSyncing } = useNetworkStatus();

  // Don't show anything if online and showWhenOnline is false
  if (isOnline && !showWhenOnline && !isSyncing) {
    return null;
  }

  return (
    <div className={`network-status-indicator ${className}`}>
      {isSyncing && (
        <div className="syncing-indicator">
          <span className="sync-icon">🔄</span>
          <span className="sync-text">Syncing...</span>
        </div>
      )}

      {!isOnline && (
        <div className="offline-indicator">
          <span className="offline-icon">📴</span>
          <span className="offline-text">
            {isPersistenceEnabled
              ? 'Working offline - changes will sync when online'
              : 'No connection - changes may not be saved'}
          </span>
        </div>
      )}

      {isOnline && showWhenOnline && !isSyncing && (
        <div className="online-indicator">
          <span className="online-icon">🌐</span>
          <span className="online-text">Connected</span>
        </div>
      )}
    </div>
  );
};

export default NetworkStatusIndicator;
