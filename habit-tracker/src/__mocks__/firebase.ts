// Mock Firebase modules for testing

// Mock Firebase app
const mockApp = {
  name: 'test-app',
  options: {
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
  },
};

export const initializeApp = jest.fn(() => mockApp);

// Mock Firestore
export const getFirestore = jest.fn(() => ({
  app: mockApp,
}));

export const connectFirestoreEmulator = jest.fn();
export const enableMultiTabIndexedDbPersistence = jest.fn(() =>
  Promise.resolve()
);

// Mock Firestore operations
export const collection = jest.fn();
export const doc = jest.fn();
export const addDoc = jest.fn(() => Promise.resolve({ id: 'mock-id' }));
export const updateDoc = jest.fn(() => Promise.resolve());
export const deleteDoc = jest.fn(() => Promise.resolve());
export const getDoc = jest.fn(() =>
  Promise.resolve({
    exists: () => true,
    data: () => ({}),
    id: 'mock-id',
  })
);
export const getDocs = jest.fn(() =>
  Promise.resolve({
    docs: [],
    empty: true,
    size: 0,
  })
);
export const query = jest.fn();
export const where = jest.fn();
export const orderBy = jest.fn();
export const limit = jest.fn();
export const onSnapshot = jest.fn();
export const serverTimestamp = jest.fn(() => new Date());

// Mock Authentication
export const getAuth = jest.fn(() => ({
  app: mockApp,
  currentUser: null,
  onAuthStateChanged: jest.fn(),
}));

export const connectAuthEmulator = jest.fn();
export const signInAnonymously = jest.fn(() =>
  Promise.resolve({
    user: {
      uid: 'mock-user-id',
      isAnonymous: true,
    },
  })
);

export const onAuthStateChanged = jest.fn();
export const signOut = jest.fn(() => Promise.resolve());

// Default export for the firebase/app module
export default {
  initializeApp,
};
