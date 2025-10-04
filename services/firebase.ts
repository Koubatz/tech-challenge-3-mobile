import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  Auth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User
} from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';

// Configuração Firebase usando variáveis de ambiente
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY ?? "demo-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? "demo-project.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID ?? "demo-project",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? "demo-project.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? "123456789",
  appId: process.env.FIREBASE_APP_ID ?? "1:123456789:web:demo",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let functions: any = null;

// Verificar se estamos em desenvolvimento
const isDevelopment = false;

// Inicializar Firebase
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  // Inicializar Auth com persistência AsyncStorage
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    // Se initializeAuth falhar (já inicializado), usar getAuth
    auth = getAuth(app);
  }
  
  functions = getFunctions(app);
  
  // Conectar ao emulador em desenvolvimento (silenciosamente)
  if (isDevelopment) {
    try {
      // Tentar conectar ao Auth Emulator
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
      
      // Tentar conectar ao Functions Emulator
      connectFunctionsEmulator(functions, "127.0.0.1", 5001);
      
      // Emulador conectado com sucesso (modo silencioso)
    } catch (emulatorError) {
      // Emulador não disponível - continuar em modo desenvolvimento (silencioso)
    }
  }
  
} catch (error) {
  console.warn('Erro ao inicializar Firebase:', error);
  app = null;
  auth = null;
  functions = null;
}

export const healthCheck = httpsCallable(functions, 'healthCheck');

type CreateBankAccountPayload = {
  uid: string;
  email?: string | null;
  ownerName?: string | null;
};

type CreateBankAccountResponse = {
  success?: boolean;
  message?: string;
};

export const createBankAccount = async (
  payload: CreateBankAccountPayload
): Promise<HttpsCallableResult<CreateBankAccountResponse>> => {
  if (!functions) {
    throw new Error('Firebase Functions não está configurado');
  }

  const callable = httpsCallable(functions, 'createBankAccount');
  return callable(payload);
};

// Funções de autenticação
export const signIn = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase Auth não está configurado');
  }
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase Auth não está configurado');
  }
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  if (!auth) {
    throw new Error('Firebase Auth não está configurado');
  }
  return await firebaseSignOut(auth);
};

export const getCurrentUser = (): User | null => {
  if (!auth) {
    return null;
  }
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    throw new Error('Firebase Auth não está configurado');
  }
  return onAuthStateChanged(auth, callback);
};

// Função para verificar se o Firebase está disponível
export const isFirebaseAvailable = (): boolean => {
  return auth !== null;
};

export { auth };
