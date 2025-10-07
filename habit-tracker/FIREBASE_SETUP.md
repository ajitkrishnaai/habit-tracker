# Firebase Setup Guide

This guide walks you through setting up Firebase for the Personal Habit Tracker app.

## Prerequisites

1. Google account
2. Node.js and npm installed
3. This project cloned locally

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "personal-habit-tracker")
4. Disable Google Analytics (not needed for this app)
5. Click "Create project"

## Step 2: Enable Required Services

### Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

### Authentication

1. Go to "Authentication" > "Sign-in method"
2. Enable "Anonymous" authentication
3. Click "Save"

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. In "Your apps" section, click "Web" app icon (</>)
3. Register app with nickname (e.g., "habit-tracker-web")
4. Copy the configuration object values

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration values in `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## Step 5: Test Firebase Connection

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open browser console and check for Firebase connection errors
3. The app should load without Firebase-related errors

## Optional: Firebase Emulator (Development)

For local development without connecting to Firebase:

1. Install Firebase CLI:

   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:

   ```bash
   firebase login
   ```

3. Initialize emulators:

   ```bash
   firebase init emulators
   ```

4. Set environment variable:

   ```
   VITE_USE_FIREBASE_EMULATOR=true
   ```

5. Start emulators:
   ```bash
   firebase emulators:start
   ```

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Only share configuration values with trusted team members
- Use Firebase security rules in production

## Production Setup

For production deployment:

1. Update Firestore security rules
2. Configure Firebase hosting (optional)
3. Set up environment variables in your hosting platform
4. Update CORS settings if needed

## Troubleshooting

### Common Issues

1. **"Firebase config object is invalid"**
   - Check that all environment variables are set correctly
   - Ensure no extra spaces or quotes in `.env` file

2. **"Missing or insufficient permissions"**
   - Check Firestore security rules
   - Ensure Anonymous authentication is enabled

3. **"Network error"**
   - Check internet connection
   - Verify Firebase project is active
   - Check browser console for specific errors

### Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com/)
