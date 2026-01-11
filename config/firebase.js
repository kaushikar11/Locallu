// Backend Firebase Client SDK Configuration (Node.js)
const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');
const dotenv = require('dotenv');
dotenv.config();

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCFW4OMoXV9HJykIydcycSrjqkT8gsniy0",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "locallu-locallu.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "locallu-locallu",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "locallu-locallu.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "306868870532",
  appId: process.env.FIREBASE_APP_ID || "1:306868870532:web:166f317ecfd0a87a7351d1",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-KS9DD8BPXC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Log initialization
console.log('✅ Firebase Client SDK initialized successfully');
console.log('Firebase Project ID:', firebaseConfig.projectId);

// Note: For Authentication operations (createUser, getUserByEmail), we use Firebase REST API
// See utils/firebaseAuth.js for Auth helper functions

module.exports = { app, db };
