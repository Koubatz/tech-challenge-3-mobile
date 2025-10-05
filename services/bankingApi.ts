import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

type Transaction = {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  timestamp: string;
  newBalance: number;
};

type StatementResponse = {
  success: boolean;
  transactions: Transaction[];
};

type AccountDetailsResponse = {
  success: boolean;
  accountNumber: string;
  agency: string;
  ownerName: string;
  balance: number;
};

class BankingApiService {
  private idToken: string | null = null;

  setAuthToken(token: string) {
    this.idToken = token;
  }

  private async callFunction<T>(functionName: string, data: any = {}): Promise<T> {
    try {
      const callable = httpsCallable(functions, functionName);
      const result = await callable(data);
      return result.data as T;
    } catch (error) {
      console.error(`Erro na chamada para ${functionName}:`, error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ success: boolean; docId: string }> {
    return this.callFunction('healthCheck');
  }

  async getAccountStatement(accountNumber: string): Promise<StatementResponse> {
    return this.callFunction('getAccountStatement', { accountNumber });
  }

  async getAccountDetails(accountNumber: string): Promise<AccountDetailsResponse> {
    return this.callFunction('getAccountDetails', { accountNumber });
  }

  async performTransaction(
    accountNumber: string,
    amount: number,
    type: 'DEPOSIT' | 'WITHDRAWAL'
  ): Promise<{ success: boolean; transactionId: string; newBalance: number }> {
    return this.callFunction('performTransaction', {
      accountNumber,
      amount,
      type,
    });
  }

  async createBankAccount(ownerName: string): Promise<{
    success: boolean;
    docId: string;
    accountNumber: string;
  }> {
    return this.callFunction('createBankAccount', { ownerName });
  }
}

export const bankingApi = new BankingApiService();
export type { AccountDetailsResponse, StatementResponse, Transaction };

