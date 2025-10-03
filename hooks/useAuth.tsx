import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signIn, signUp, signOut, getCurrentUser, isFirebaseAvailable } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock user para desenvolvimento quando Firebase não estiver configurado
const createMockUser = (email: string): User => ({
  uid: 'mock-user-' + Date.now(),
  email,
  emailVerified: true,
  displayName: null,
  photoURL: null,
  phoneNumber: null,
  providerId: 'mock',
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
} as User);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseConfigured = isFirebaseAvailable();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      if (firebaseConfigured) {
        try {
          // Configurar Firebase Auth
          unsubscribe = onAuthStateChange(async (user) => {
            setUser(user);
            setLoading(false);
            
            // Persistir estado de autenticação
            if (user) {
              await AsyncStorage.setItem('userToken', user.uid);
            } else {
              await AsyncStorage.removeItem('userToken');
            }
          });

          // Verificar se há um usuário logado ao inicializar
          const token = await AsyncStorage.getItem('userToken');
          const currentUser = getCurrentUser();
          
          if (token && currentUser) {
            setUser(currentUser);
          }
          
          setLoading(false);
        } catch (error: any) {
          console.warn('Erro ao configurar Firebase Auth:', error.message);
          setLoading(false);
        }
      } else {
        // Modo de desenvolvimento - verificar se há um usuário mock salvo
        console.warn('Firebase não configurado, usando modo de desenvolvimento');
        try {
          const mockUserData = await AsyncStorage.getItem('mockUser');
          if (mockUserData) {
            const userData = JSON.parse(mockUserData);
            setUser(createMockUser(userData.email));
          }
        } catch (storageError) {
          console.error('Erro ao verificar usuário mock:', storageError);
        }
        
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [firebaseConfigured]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      if (firebaseConfigured) {
        const userCredential = await signIn(email, password);
        setUser(userCredential.user);
        await AsyncStorage.setItem('userToken', userCredential.user.uid);
      } else {
        // Modo de desenvolvimento - simular login
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        }
        
        const mockUser = createMockUser(email);
        setUser(mockUser);
        await AsyncStorage.setItem('userToken', mockUser.uid);
        await AsyncStorage.setItem('mockUser', JSON.stringify({ email }));
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Tratar erros específicos do Firebase
      let errorMessage = 'Erro ao fazer login';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/wrong-password':
          case 'auth/user-not-found':
            errorMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Email inválido. Verifique o formato do email.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Esta conta foi desabilitada. Entre em contato com o suporte.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
            break;
          default:
            errorMessage = error.message || 'Erro ao fazer login';
        }
      } else {
        errorMessage = error.message || 'Erro ao fazer login';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      if (firebaseConfigured) {
        const userCredential = await signUp(email, password);
        setUser(userCredential.user);
        await AsyncStorage.setItem('userToken', userCredential.user.uid);
      } else {
        // Modo de desenvolvimento - simular cadastro
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        }
        
        const mockUser = createMockUser(email);
        setUser(mockUser);
        await AsyncStorage.setItem('userToken', mockUser.uid);
        await AsyncStorage.setItem('mockUser', JSON.stringify({ email }));
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao criar conta' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (firebaseConfigured) {
        await signOut();
      }
      
      setUser(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('mockUser');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };



  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};