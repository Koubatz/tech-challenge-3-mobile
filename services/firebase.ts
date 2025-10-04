import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import {
  Auth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User
} from 'firebase/auth';
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
  type Functions,
  type HttpsCallableResult,
} from 'firebase/functions';

type FirebaseEnvKey =
  | 'EXPO_PUBLIC_FIREBASE_API_KEY'
  | 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'
  | 'EXPO_PUBLIC_FIREBASE_PROJECT_ID'
  | 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'
  | 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
  | 'EXPO_PUBLIC_FIREBASE_APP_ID';

const readEnv = (key: FirebaseEnvKey): string => {
  const value = process.env[key];

  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing Firebase environment variable: ${key}`);
  }

  return value;
};

// Configuração Firebase usando variáveis de ambiente
const firebaseConfig: FirebaseOptions = {
  apiKey: readEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: readEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let functions: Functions | null = null;

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
    const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;
    auth = initializeAuth(app, {
      persistence: reactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // Se initializeAuth falhar (já inicializado), usar getAuth
    auth = getAuth(app);
  }
  
  functions = getFunctions(app);

  // Conectar ao emulador em desenvolvimento (silenciosamente)
  if (isDevelopment && auth && functions) {
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

const getFunctionsInstance = (): Functions => {
  if (!functions) {
    throw new Error('Firebase Functions não está configurado');
  }

  return functions;
};

type HealthCheckResponse = {
  success: boolean;
  docId?: string;
  error?: string;
};

export const healthCheck = async (): Promise<HttpsCallableResult<HealthCheckResponse>> => {
  const callable = httpsCallable<unknown, HealthCheckResponse>(
    getFunctionsInstance(),
    'healthCheck',
  );
  return callable();
};

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
  const callable = httpsCallable<CreateBankAccountPayload, CreateBankAccountResponse>(
    getFunctionsInstance(),
    'createBankAccount',
  );
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
