import { useState, useCallback } from 'react';
import {
  AppError,
  parseFirebaseError,
  getUserErrorMessage,
  logError,
  isRecoverableError,
} from '../utils/errorHandler';

interface UseErrorHandlerReturn {
  error: AppError | null;
  errorMessage: string | null;
  isRecoverable: boolean;
  handleError: (error: unknown, context?: string) => void;
  clearError: () => void;
  retryOperation: <T>(operation: () => Promise<T>) => Promise<T | null>;
}

/**
 * Custom hook for handling errors in React components
 * Provides error state management and user-friendly error messages
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<AppError | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecoverable, setIsRecoverable] = useState<boolean>(false);

  /**
   * Handle an error
   */
  const handleError = useCallback((error: unknown, context?: string) => {
    const appError = parseFirebaseError(error);
    const message = getUserErrorMessage(error);
    const recoverable = isRecoverableError(error);

    setError(appError);
    setErrorMessage(message);
    setIsRecoverable(recoverable);

    // Log the error
    logError(appError, context);
  }, []);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
    setErrorMessage(null);
    setIsRecoverable(false);
  }, []);

  /**
   * Retry an operation after an error
   */
  const retryOperation = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T | null> => {
      try {
        clearError();
        const result = await operation();
        return result;
      } catch (err) {
        handleError(err, 'Retry operation');
        return null;
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    errorMessage,
    isRecoverable,
    handleError,
    clearError,
    retryOperation,
  };
};
