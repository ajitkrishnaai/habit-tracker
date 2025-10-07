import React from 'react';
import { AppError, AppErrorType } from '../utils/errorHandler';

interface ErrorDisplayProps {
  error: AppError | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Component to display error messages to users
 * Shows appropriate icons and actions based on error type
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.userMessage;
  const errorType =
    typeof error === 'string' ? AppErrorType.UNKNOWN : error.type;

  const getErrorIcon = (): string => {
    switch (errorType) {
      case AppErrorType.NETWORK:
        return '🌐';
      case AppErrorType.OFFLINE:
        return '📴';
      case AppErrorType.AUTH:
        return '🔐';
      case AppErrorType.PERMISSION:
        return '🚫';
      case AppErrorType.NOT_FOUND:
        return '🔍';
      case AppErrorType.VALIDATION:
        return '⚠️';
      default:
        return '❌';
    }
  };

  const getErrorClass = (): string => {
    switch (errorType) {
      case AppErrorType.NETWORK:
      case AppErrorType.OFFLINE:
        return 'error-network';
      case AppErrorType.AUTH:
      case AppErrorType.PERMISSION:
        return 'error-auth';
      case AppErrorType.VALIDATION:
        return 'error-validation';
      default:
        return 'error-general';
    }
  };

  const showRetryButton =
    onRetry &&
    (errorType === AppErrorType.NETWORK ||
      errorType === AppErrorType.UNKNOWN);

  return (
    <div className={`error-display ${getErrorClass()} ${className}`}>
      <div className="error-content">
        <span className="error-icon">{getErrorIcon()}</span>
        <p className="error-message">{errorMessage}</p>
      </div>
      <div className="error-actions">
        {showRetryButton && (
          <button onClick={onRetry} className="retry-button">
            Retry
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="dismiss-button">
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
