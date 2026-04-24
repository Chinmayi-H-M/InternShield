const admin = require('firebase-admin');

// Note: Ensure you download the serviceAccountKey.json from your Firebase Project Settings
// and place it in the root of the backend folder or provide env variables.
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (error) {
  console.warn('⚠️  serviceAccountKey.json not found! Firebase logic might fail if other env credentials are not set.');
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else if (process.env.FIREBASE_PROJECT_ID) {
    // Alternatively fallback to env variables if available
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
    });
} else {
    // This will initialize with local default credentials, might fail if none are provided.
    try {
        admin.initializeApp();
    } catch (e) {
        console.error("Firebase Initialization failed, ensure credentials are provided.");
    }
}

const db = admin.firestore ? admin.firestore() : null;

module.exports = { db };
