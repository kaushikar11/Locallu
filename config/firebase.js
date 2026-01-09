const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

// Build service account from environment variables
const serviceAccount = {
  type: process.env.FIREBASE_TYPE || 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
  token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || 'googleapis.com'
};

// Fallback to JSON file if env vars are not set (for local development)
let credential;
try {
  if (serviceAccount.private_key && serviceAccount.client_email) {
    credential = admin.credential.cert(serviceAccount);
  } else {
    // Fallback to JSON file
    try {
      const serviceAccountJson = require('./serviceAccountKey.json');
      credential = admin.credential.cert(serviceAccountJson);
    } catch (jsonError) {
      // If JSON file doesn't exist, try to use env vars anyway
      console.warn('Warning: serviceAccountKey.json not found, using environment variables');
      credential = admin.credential.cert(serviceAccount);
    }
  }
} catch (error) {
  console.error('Error initializing Firebase credentials:', error.message);
  throw new Error('Failed to initialize Firebase credentials. Please check your environment variables.');
}

// Initialize Firebase Admin (only if not already initialized)
let app;
try {
  app = admin.app();
  console.log('Firebase Admin already initialized');
} catch (error) {
  // App doesn't exist, initialize it
  app = admin.initializeApp({
    credential: credential,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'wf41-ad0e9.appspot.com'
  });
  console.log('Firebase Admin initialized successfully');
}

const db = admin.firestore();
const storage = admin.storage();
const bucket = admin.storage().bucket();
const auth = admin.auth(); // Include auth for authentication operations

// Async initialization check for Firestore (non-blocking)
db.collection('tasks').get()
  .then(() => {
    console.log('Firestore database is connected.');
  })
  .catch((error) => {
    console.error('Error connecting to Firestore:', error.message);
    // Don't throw - allow app to continue even if initial check fails
  });

module.exports = { admin, db, storage, bucket, auth };
