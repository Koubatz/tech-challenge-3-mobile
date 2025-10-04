import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ACCOUNT_DETAILS_STORAGE_KEY } from '../constants/storageKeys';
import { GetAccountDetailsResponse, getAccountDetails } from '../services/firebase';
import { useAuth } from './useAuth';

type BankAccountDetails = Omit<GetAccountDetailsResponse, 'success'>;

interface AccountContextValue {
  account: BankAccountDetails | null;
  loadingAccount: boolean;
  error: string | null;
  refreshAccount: (accountNumberOverride?: string) => Promise<void>;
  clearAccount: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export const AccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [account, setAccount] = useState<BankAccountDetails | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const persistAccount = useCallback(async (details: BankAccountDetails | null) => {
    try {
      if (!details) {
        await AsyncStorage.removeItem(ACCOUNT_DETAILS_STORAGE_KEY);
        return;
      }

      await AsyncStorage.setItem(ACCOUNT_DETAILS_STORAGE_KEY, JSON.stringify(details));
    } catch (storageError) {
      console.warn('Não foi possível persistir os dados da conta:', storageError);
    }
  }, []);

  const loadStoredAccount = useCallback(async (): Promise<BankAccountDetails | null> => {
    try {
      const stored = await AsyncStorage.getItem(ACCOUNT_DETAILS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BankAccountDetails;
        if (isMountedRef.current) {
          setAccount(parsed);
        }
        return parsed;
      }
    } catch (storageError) {
      console.warn('Não foi possível carregar os dados da conta armazenados:', storageError);
    }

    return null;
  }, []);

  const clearAccount = useCallback(async () => {
    if (isMountedRef.current) {
      setAccount(null);
      setError(null);
    }

    await persistAccount(null).catch(() => undefined);
  }, [persistAccount]);

  const refreshAccount = useCallback(async (accountNumberOverride?: string) => {
    if (!isAuthenticated) {
      await clearAccount();
      return;
    }

    if (isMountedRef.current) {
      setLoadingAccount(true);
      setError(null);
    }

    try {
      let targetAccountNumber = accountNumberOverride ?? account?.accountNumber ?? null;

      if (!targetAccountNumber) {
        const storedAccount = await loadStoredAccount();
        targetAccountNumber = storedAccount?.accountNumber ?? null;
      }

      if (!targetAccountNumber) {
        throw new Error('Número da conta não encontrado. Finalize o cadastro ou entre em contato com o suporte.');
      }

      const response = await getAccountDetails({ accountNumber: targetAccountNumber });

      if (!response?.success) {
        throw new Error('Não foi possível obter os dados da conta.');
      }

      const { success: _success, ...details } = response;

      if (isMountedRef.current) {
        setAccount(details);
      }

      await persistAccount(details);
    } catch (accountError: any) {
      console.error('Erro ao buscar detalhes da conta:', accountError);
      if (isMountedRef.current) {
        setError(accountError?.message ?? 'Erro ao buscar detalhes da conta.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingAccount(false);
      }
    }
  }, [account, clearAccount, isAuthenticated, loadStoredAccount, persistAccount]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearAccount();
      return;
    }

    let cancelled = false;

    const synchronizeAccount = async () => {
      const storedAccount = await loadStoredAccount();
      if (!cancelled) {
        await refreshAccount(storedAccount?.accountNumber ?? undefined);
      }
    };

    synchronizeAccount();

    return () => {
      cancelled = true;
    };
  }, [clearAccount, isAuthenticated, loadStoredAccount, refreshAccount]);

  const value = useMemo<AccountContextValue>(
    () => ({
      account,
      loadingAccount,
      error,
      refreshAccount,
      clearAccount,
    }),
    [account, loadingAccount, error, refreshAccount, clearAccount]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export const useAccount = (): AccountContextValue => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount deve ser usado dentro de um AccountProvider');
  }

  return context;
};
