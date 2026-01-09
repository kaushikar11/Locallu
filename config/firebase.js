const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const dotenv = require('dotenv');
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'wf41-ad0e9.appspot.com' // Update with your actual storage bucket URL
});

const db = admin.firestore();
const storage = admin.storage();
const bucket = admin.storage().bucket();
const auth = admin.auth(); // Include auth for authentication operations

// Async initialization check for Firestore
db.collection('tasks').get()
  .then(() => {
    console.log('Firestore database is connected.');
  })
  .catch((error) => {
    console.error('Error connecting to Firestore:', error);
  });

module.exports = { admin, db, storage, bucket, auth };
