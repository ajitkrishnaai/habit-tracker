import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

interface UseFirestoreReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  addDocument: (collectionPath: string, data: DocumentData) => Promise<string>;
  updateDocument: (
    collectionPath: string,
    docId: string,
    data: Partial<DocumentData>
  ) => Promise<void>;
  deleteDocument: (collectionPath: string, docId: string) => Promise<void>;
  getDocument: (collectionPath: string, docId: string) => Promise<DocumentData | null>;
}

/**
 * Custom hook for Firestore data operations
 * Provides CRUD operations and real-time data synchronization
 *
 * @param collectionPath - Path to the Firestore collection relative to user's document
 * @param queryConstraints - Optional query constraints for filtering and ordering
 */
export const useFirestore = <T extends DocumentData>(
  collectionPath: string,
  queryConstraints: QueryConstraint[] = []
): UseFirestoreReturn<T> => {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Set up real-time listener for collection
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Construct the full path: users/{userId}/{collectionPath}
      const userCollectionPath = `users/${user.uid}/${collectionPath}`;
      const collectionRef = collection(db, userCollectionPath);

      // Build query with constraints if provided
      const q = queryConstraints.length > 0
        ? query(collectionRef, ...queryConstraints)
        : query(collectionRef);

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const documents: T[] = [];
          snapshot.forEach((doc) => {
            documents.push({
              id: doc.id,
              ...doc.data(),
            } as unknown as T);
          });
          setData(documents);
          setLoading(false);
          setError(null);
        },
        (err) => {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to fetch data';
          setError(errorMessage);
          setLoading(false);
          console.error('Firestore listener error:', err);
        }
      );

      // Cleanup listener on unmount or when dependencies change
      return () => unsubscribe();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to set up listener';
      setError(errorMessage);
      setLoading(false);
      console.error('Firestore setup error:', err);
    }
  }, [user, collectionPath, queryConstraints]);

  /**
   * Add a new document to the collection
   */
  const addDocument = useCallback(
    async (collectionPath: string, data: DocumentData): Promise<string> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        const userCollectionPath = `users/${user.uid}/${collectionPath}`;
        const collectionRef = collection(db, userCollectionPath);
        const newDocRef = doc(collectionRef);

        await setDoc(newDocRef, {
          ...data,
          id: newDocRef.id,
        });

        return newDocRef.id;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to add document';
        setError(errorMessage);
        console.error('Add document error:', err);
        throw err;
      }
    },
    [user]
  );

  /**
   * Update an existing document
   */
  const updateDocument = useCallback(
    async (
      collectionPath: string,
      docId: string,
      data: Partial<DocumentData>
    ): Promise<void> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        const userCollectionPath = `users/${user.uid}/${collectionPath}`;
        const docRef = doc(db, userCollectionPath, docId);

        await updateDoc(docRef, data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update document';
        setError(errorMessage);
        console.error('Update document error:', err);
        throw err;
      }
    },
    [user]
  );

  /**
   * Delete a document from the collection
   */
  const deleteDocument = useCallback(
    async (collectionPath: string, docId: string): Promise<void> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        const userCollectionPath = `users/${user.uid}/${collectionPath}`;
        const docRef = doc(db, userCollectionPath, docId);

        await deleteDoc(docRef);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete document';
        setError(errorMessage);
        console.error('Delete document error:', err);
        throw err;
      }
    },
    [user]
  );

  /**
   * Get a single document by ID
   */
  const getDocument = useCallback(
    async (collectionPath: string, docId: string): Promise<DocumentData | null> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        const userCollectionPath = `users/${user.uid}/${collectionPath}`;
        const docRef = doc(db, userCollectionPath, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data(),
          };
        }

        return null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get document';
        setError(errorMessage);
        console.error('Get document error:', err);
        throw err;
      }
    },
    [user]
  );

  return {
    data,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
  };
};
