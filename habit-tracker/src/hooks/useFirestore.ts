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
import { parseFirebaseError, getUserErrorMessage, logError } from '../utils/errorHandler';

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
          const appError = parseFirebaseError(err);
          const errorMessage = getUserErrorMessage(err);
          setError(errorMessage);
          setLoading(false);
          logError(appError, 'Firestore listener error', {
            collectionPath: userCollectionPath,
          });
        }
      );

      // Cleanup listener on unmount or when dependencies change
      return () => unsubscribe();
    } catch (err) {
      const appError = parseFirebaseError(err);
      const errorMessage = getUserErrorMessage(err);
      setError(errorMessage);
      setLoading(false);
      logError(appError, 'Firestore setup error', {
        collectionPath: userCollectionPath,
      });
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
        const appError = parseFirebaseError(err);
        const errorMessage = getUserErrorMessage(err);
        setError(errorMessage);
        logError(appError, 'Add document error', { collectionPath });
        throw appError;
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
        const appError = parseFirebaseError(err);
        const errorMessage = getUserErrorMessage(err);
        setError(errorMessage);
        logError(appError, 'Update document error', { collectionPath, docId });
        throw appError;
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
        const appError = parseFirebaseError(err);
        const errorMessage = getUserErrorMessage(err);
        setError(errorMessage);
        logError(appError, 'Delete document error', { collectionPath, docId });
        throw appError;
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
        const appError = parseFirebaseError(err);
        const errorMessage = getUserErrorMessage(err);
        setError(errorMessage);
        logError(appError, 'Get document error', { collectionPath, docId });
        throw appError;
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
