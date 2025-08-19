
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

try {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error('FIREBASE_PROJECT_ID is not set in .env file');
    }
    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error('FIREBASE_CLIENT_EMAIL is not set in .env file');
    }
    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY is not set in .env file');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }
} catch (error: any) {
  console.error('Firebase admin initialization error', error.message);
  // Throw a more descriptive error to make it clear what's happening.
  throw new Error(`Firebase Admin SDK initialization failed: ${error.message}. Please check your .env file and Firebase service account credentials.`);
}

export const dbAdmin = admin.firestore();
