import { db, auth } from './firebase.test-config';

// This test verifies that the testing environment is working correctly
describe('Testing Environment', () => {
  it('should have mocked environment variables', () => {
    expect(process.env.VITE_FIREBASE_PROJECT_ID).toBe('test-project');
    expect(process.env.VITE_FIREBASE_API_KEY).toBe('test-api-key');
  });

  it('should mock localStorage', () => {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
    expect(localStorage.setItem).toHaveBeenCalledWith('test', 'value');
  });

  it('should have mocked window.matchMedia', () => {
    const media = window.matchMedia('(min-width: 768px)');
    expect(media.matches).toBe(false);
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)');
  });

  it('should have DOM testing utilities available', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello World';
    expect(div.textContent).toBe('Hello World');
  });
});

describe('Firebase Configuration', () => {
  it('should initialize Firestore database', () => {
    expect(db).toBeDefined();
    expect(db.app).toBeDefined();
  });

  it('should initialize Firebase Auth', () => {
    expect(auth).toBeDefined();
    expect(auth.app).toBeDefined();
  });

  it('should use environment variables for configuration', () => {
    const config = auth.app.options;

    // In test environment, we use mocked values
    expect(config.apiKey).toBeDefined();
    expect(config.authDomain).toBeDefined();
    expect(config.projectId).toBeDefined();
  });

  it('should have matching app instances', () => {
    expect(db.app).toBe(auth.app);
  });
});
