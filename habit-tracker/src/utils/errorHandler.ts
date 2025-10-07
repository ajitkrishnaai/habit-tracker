/**
 * Error Handler Utility
 * Centralized error handling for Firebase operations and network issues
 */

import { FirebaseError } from 'firebase/app';

/**
 * Custom error types for the application
 */
export enum AppErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
  FIRESTORE = 'FIRESTORE',
  OFFLINE = 'OFFLINE',
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  type: AppErrorType;
  code?: string;
  originalError?: Error;
  userMessage: string;

  constructor(
    type: AppErrorType,
    message: string,
    userMessage: string,
    code?: string,
    originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.originalError = originalError;
    this.userMessage = userMessage;
  }
}

/**
 * Firebase error codes and their user-friendly messages
 */
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  'auth/user-not-found': 'User account not found. Please try again.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/weak-password': 'Password is too weak. Please use a stronger password.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',

  // Firestore errors
  'permission-denied': 'You do not have permission to perform this action.',
  'not-found': 'The requested data was not found.',
  'already-exists': 'This data already exists.',
  'resource-exhausted': 'Too many requests. Please try again later.',
  'failed-precondition': 'Operation cannot be completed in the current state.',
  'aborted': 'Operation was aborted. Please try again.',
  'out-of-range': 'Invalid input value.',
  'unimplemented': 'This feature is not yet available.',
  'internal': 'Internal server error. Please try again later.',
  'unavailable': 'Service is temporarily unavailable. Please try again.',
  'data-loss': 'Data loss occurred. Please contact support.',
  'unauthenticated': 'Please sign in to continue.',
  'deadline-exceeded': 'Request timeout. Please try again.',
  'cancelled': 'Operation was cancelled.',

  // Network errors
  'network-error': 'Network connection lost. Working in offline mode.',
  'offline': 'You are offline. Changes will sync when you reconnect.',
};

/**
 * Parse Firebase error and convert to AppError
 */
export const parseFirebaseError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof FirebaseError) {
    const errorCode = error.code;
    const userMessage =
      FIREBASE_ERROR_MESSAGES[errorCode] ||
      'An error occurred. Please try again.';

    // Determine error type based on code
    let errorType = AppErrorType.UNKNOWN;

    if (errorCode.startsWith('auth/')) {
      errorType = AppErrorType.AUTH;
    } else if (errorCode === 'permission-denied') {
      errorType = AppErrorType.PERMISSION;
    } else if (errorCode === 'not-found') {
      errorType = AppErrorType.NOT_FOUND;
    } else if (
      errorCode.includes('network') ||
      errorCode === 'unavailable'
    ) {
      errorType = AppErrorType.NETWORK;
    } else {
      errorType = AppErrorType.FIRESTORE;
    }

    return new AppError(
      errorType,
      error.message,
      userMessage,
      errorCode,
      error
    );
  }

  if (error instanceof Error) {
    // Check for network errors
    if (
      error.message.includes('network') ||
      error.message.includes('offline')
    ) {
      return new AppError(
        AppErrorType.NETWORK,
        error.message,
        FIREBASE_ERROR_MESSAGES['network-error'],
        'network-error',
        error
      );
    }

    return new AppError(
      AppErrorType.UNKNOWN,
      error.message,
      'An unexpected error occurred. Please try again.',
      undefined,
      error
    );
  }

  return new AppError(
    AppErrorType.UNKNOWN,
    String(error),
    'An unexpected error occurred. Please try again.',
    undefined,
    undefined
  );
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  const appError = parseFirebaseError(error);
  return appError.type === AppErrorType.NETWORK;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  const appError = parseFirebaseError(error);
  return appError.type === AppErrorType.AUTH;
};

/**
 * Check if error is a permission error
 */
export const isPermissionError = (error: unknown): boolean => {
  const appError = parseFirebaseError(error);
  return appError.type === AppErrorType.PERMISSION;
};

/**
 * Check if error is recoverable (can retry)
 */
export const isRecoverableError = (error: unknown): boolean => {
  const appError = parseFirebaseError(error);

  // Network errors and temporary unavailability are recoverable
  if (appError.type === AppErrorType.NETWORK) {
    return true;
  }

  if (appError.code) {
    const recoverableCodes = [
      'unavailable',
      'deadline-exceeded',
      'resource-exhausted',
      'aborted',
      'cancelled',
      'auth/network-request-failed',
    ];
    return recoverableCodes.includes(appError.code);
  }

  return false;
};

/**
 * Get user-friendly error message
 */
export const getUserErrorMessage = (error: unknown): string => {
  const appError = parseFirebaseError(error);
  return appError.userMessage;
};

/**
 * Log error to console (and potentially to error tracking service)
 */
export const logError = (
  error: unknown,
  context?: string,
  metadata?: Record<string, unknown>
): void => {
  const appError = parseFirebaseError(error);

  console.error('Error occurred:', {
    context,
    type: appError.type,
    code: appError.code,
    message: appError.message,
    userMessage: appError.userMessage,
    metadata,
    originalError: appError.originalError,
  });

  // TODO: In production, send to error tracking service (e.g., Sentry)
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(appError, { contexts: { metadata } });
  // }
};

/**
 * Handle error with retry logic
 */
export const handleErrorWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not recoverable
      if (!isRecoverableError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt < maxRetries - 1) {
        console.log(
          `Retry attempt ${attempt + 1}/${maxRetries} after error:`,
          getUserErrorMessage(error)
        );
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError;
};

/**
 * Create validation error
 */
export const createValidationError = (message: string): AppError => {
  return new AppError(
    AppErrorType.VALIDATION,
    message,
    message,
    'validation-error'
  );
};

/**
 * Create network error
 */
export const createNetworkError = (message?: string): AppError => {
  return new AppError(
    AppErrorType.NETWORK,
    message || 'Network error occurred',
    FIREBASE_ERROR_MESSAGES['network-error'],
    'network-error'
  );
};

/**
 * Create offline error
 */
export const createOfflineError = (): AppError => {
  return new AppError(
    AppErrorType.OFFLINE,
    'Application is offline',
    FIREBASE_ERROR_MESSAGES['offline'],
    'offline'
  );
};

/**
 * Wrap async operation with error handling
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ data?: T; error?: AppError }> => {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const appError = parseFirebaseError(error);
    logError(appError, context);
    return { error: appError };
  }
};
