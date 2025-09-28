import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

// TODO: Replace with your app's Firebase project configuration.
// See: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY ?? "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.FIREBASE_APP_ID ?? "",
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const functions = getFunctions(app);

export const healthCheck = httpsCallable(functions, 'healthCheck');
