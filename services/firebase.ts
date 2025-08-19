import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

// TODO: Replace with your app's Firebase project configuration.
// See: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyAbkeyGBEQ4PBmAvcSOF7dwJblEImV2vpc",
  authDomain: "fiap-tech-challenge-3-bytebank.firebaseapp.com",
  projectId: "fiap-tech-challenge-3-bytebank",
  storageBucket: "fiap-tech-challenge-3-bytebank.firebasestorage.app",
  messagingSenderId: "673832118783",
  appId: "1:673832118783:web:e5d5401ee8aaf2e0531fca"
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