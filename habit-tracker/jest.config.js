/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Firebase module mocks
    '^firebase/app$': '<rootDir>/src/__mocks__/firebase.ts',
    '^firebase/firestore$': '<rootDir>/src/__mocks__/firebase.ts',
    '^firebase/auth$': '<rootDir>/src/__mocks__/firebase.ts',
  },
  globals: {
    'import.meta': {
      env: {
        DEV: false,
        VITE_FIREBASE_API_KEY: 'test-api-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'test-project',
        VITE_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
        VITE_FIREBASE_APP_ID: 'test-app-id',
        VITE_USE_FIREBASE_EMULATOR: 'false',
      },
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/(*.)+(spec|test).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/__mocks__/**/*',
    '!src/setupTests.ts',
  ],
  // Mock environment variables for testing
  setupFiles: ['<rootDir>/src/setupTestEnv.ts'],
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
};
