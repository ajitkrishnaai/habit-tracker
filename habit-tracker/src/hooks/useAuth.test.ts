import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Mock Firebase auth
jest.mock('../config/firebase', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  signInAnonymously: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

describe('useAuth', () => {
  const mockUser = {
    uid: 'test-user-id',
    isAnonymous: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    (onAuthStateChanged as jest.Mock).mockImplementation(() => jest.fn());

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should set user when already authenticated', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      // Immediately call the callback with a user
      callback(mockUser);
      return jest.fn(); // Return unsubscribe function
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBe(null);
  });

  it('should sign in anonymously when no user is authenticated', async () => {
    (signInAnonymously as jest.Mock).mockResolvedValue({
      user: mockUser,
    });

    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      // Call callback with null (no user)
      callback(null);
      return jest.fn(); // Return unsubscribe function
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(signInAnonymously).toHaveBeenCalled();
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBe(null);
  });

  it('should handle authentication errors', async () => {
    const mockError = new Error('Authentication failed');

    (signInAnonymously as jest.Mock).mockRejectedValue(mockError);

    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      // Call callback with null (no user)
      callback(null);
      return jest.fn(); // Return unsubscribe function
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe('Authentication failed');
  });

  it('should handle auth state change errors', async () => {
    const mockError = new Error('Auth state error');

    (onAuthStateChanged as jest.Mock).mockImplementation(
      (auth, callback, errorCallback) => {
        // Call error callback
        errorCallback(mockError);
        return jest.fn(); // Return unsubscribe function
      }
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Auth state error');
  });

  it('should unsubscribe on unmount', () => {
    const mockUnsubscribe = jest.fn();

    (onAuthStateChanged as jest.Mock).mockImplementation(() => {
      return mockUnsubscribe;
    });

    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
