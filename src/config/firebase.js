// Frontend Firebase Client Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFW4OMoXV9HJykIydcycSrjqkT8gsniy0",
  authDomain: "locallu-locallu.firebaseapp.com",
  projectId: "locallu-locallu",
  storageBucket: "locallu-locallu.firebasestorage.app",
  messagingSenderId: "306868870532",
  appId: "1:306868870532:web:166f317ecfd0a87a7351d1",
  measurementId: "G-KS9DD8BPXC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

export { analytics };
export default app;


