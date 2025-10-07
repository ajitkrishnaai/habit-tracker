import { renderHook, waitFor } from '@testing-library/react';
import { useFirestore } from './useFirestore';
import { useAuth } from './useAuth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
} from 'firebase/firestore';

// Mock useAuth hook
jest.mock('./useAuth');

// Mock Firebase Firestore
jest.mock('../config/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  onSnapshot: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
}));

describe('useFirestore', () => {
  const mockUser = {
    uid: 'test-user-id',
  };

  const mockData = [
    { id: '1', name: 'Test Habit 1' },
    { id: '2', name: 'Test Habit 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
    });
  });

  it('should initialize with loading state', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
      error: null,
    });

    const { result } = renderHook(() => useFirestore('habits'));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('should set up real-time listener when user is authenticated', async () => {
    const mockUnsubscribe = jest.fn();
    const mockSnapshot = {
      forEach: (callback: (doc: any) => void) => {
        mockData.forEach((item) => {
          callback({
            id: item.id,
            data: () => ({ name: item.name }),
          });
        });
      },
    };

    (collection as jest.Mock).mockReturnValue('mock-collection');
    (query as jest.Mock).mockReturnValue('mock-query');
    (onSnapshot as jest.Mock).mockImplementation((q, callback) => {
      // Defer callback to avoid synchronous state updates during render
      setTimeout(() => callback(mockSnapshot), 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useFirestore('habits'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(collection).toHaveBeenCalledWith({}, 'users/test-user-id/habits');
    expect(result.current.data).toHaveLength(2);
  });

  it('should handle listener errors', async () => {
    const mockError = new Error('Listener error');

    (collection as jest.Mock).mockReturnValue('mock-collection');
    (query as jest.Mock).mockReturnValue('mock-query');
    (onSnapshot as jest.Mock).mockImplementation((q, callback, errorCallback) => {
      errorCallback(mockError);
      return jest.fn();
    });

    const { result } = renderHook(() => useFirestore('habits'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Listener error');
  });

  it('should add a document', async () => {
    const mockDocRef = { id: 'new-doc-id' };
    (collection as jest.Mock).mockReturnValue('mock-collection');
    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (setDoc as jest.Mock).mockResolvedValue(undefined);
    (query as jest.Mock).mockReturnValue('mock-query');
    (onSnapshot as jest.Mock).mockImplementation(() => jest.fn());

    const { result } = renderHook(() => useFirestore('habits'));

    const newData = { name: 'New Habit' };
    const docId = await result.current.addDocument('habits', newData);

    expect(docId).toBe('new-doc-id');
    expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
      ...newData,
      id: 'new-doc-id',
    });
  });

  it('should throw error when adding document without authentication', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: null,
    });

    (query as jest.Mock).mockReturnValue('mock-query');
    (onSnapshot as jest.Mock).mockImplementation(() => jest.fn());

    const { result } = renderHook(() => useFirestore('habits'));

    await expect(
      result.current.addDocument('habits', { name: 'Test' })
    ).rejects.toThrow('User not authenticated');
  });

  it('should update a document', async () => {
    const mockDocRef = { id: 'doc-id' };
    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (updateDoc as jest.Mock).mockResolvedValue(undefined);
    (query as jest.Mock).mockReturnValue('mock-query');
    (onSnapshot as jest.Mock).mockImplementation(() => jest.fn());

    const { result } = renderHook(() => useFirestore('habits'));

    const updateData = { name: 'Updated Habit' };
    await result.current.updateDocument('habits', 'doc-id', updateData);

    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, updateData);
  });

  it('should delete a document', async () => {
    const mockDocRef = { id: 'doc-id' };
    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (deleteDoc as jest.Mock).mockResolvedValue(undefined);
    (query as jest.Mock).mockReturnValue('mock-query');
    (onSnapshot as jest.Mock).mockImplementation(() => jest.fn());

    const { result } = renderHook(() => useFirestore('habits'));

    await result.current.deleteDocument('habits', 'doc-id');

    expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
  });

  it('should get a single document', async () => {
    const mockDocRef = { id: 'doc-id' };
    const mockDocSnap = {
      exists: () => true,
      id: 'doc-id',
      data: () => ({ name: 'Test Habit' }),
    };

    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
    (query as jest.Mock).mockReturnValue('mock-query');
    (onSnapshot as jest.Mock).mockImplementation(() => jest.fn());

    const { result } = renderHook(() => useFirestore('habits'));

    const document = await result.current.getDocument('habits', 'doc-id');

    expect(document).toEqual({
      id: 'doc-id',
      name: 'Test Habit',
    });
  });

  it('should return null when document does not exist', async () => {
    const mockDocRef = { id: 'doc-id' };
    const mockDocSnap = {
      exists: () => false,
    };

    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
    (query as jest.Mock).mockReturnValue('mock-query');
    (onSnapshot as jest.Mock).mockImplementation(() => jest.fn());

    const { result } = renderHook(() => useFirestore('habits'));

    const document = await result.current.getDocument('habits', 'doc-id');

    expect(document).toBe(null);
  });

  it('should clean up listener on unmount', () => {
    const mockUnsubscribe = jest.fn();

    (collection as jest.Mock).mockReturnValue('mock-collection');
    (query as jest.Mock).mockReturnValue('mock-query');
    (onSnapshot as jest.Mock).mockImplementation(() => mockUnsubscribe);

    const { unmount } = renderHook(() => useFirestore('habits'));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
