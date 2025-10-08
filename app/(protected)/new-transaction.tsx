import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAccount } from '@/hooks/useAccount';
import { bankingApi, type TransactionType } from '@/services/bankingApi';
import { formatCurrency } from '@/utils/currency';

export type TransactionTypeOption = {
  value: TransactionType;
  label: string;
};

export const transactionTypeOptions: TransactionTypeOption[] = [
  {
    value: 'DEPOSIT',
    label: 'Depósito',
  },
  {
    value: 'WITHDRAWAL',
    label: 'Saque',
  },
];

export default function NewTransaction() {
  const { account, refreshAccount } = useAccount();
  const [transactionType, setTransactionType] = useState<TransactionType>('DEPOSIT');
  const [amount, setAmount] = useState<number>(0);
  const [displayValue, setDisplayValue] = useState<string>('R$ 0,00');
  const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransactionTypeChange = (itemValue: string) => {
    setTransactionType(itemValue as TransactionType);
  };
  
  const parseCurrencyInput = (input: string): number => {
    const numbers = input.replace(/\D/g, '');
    return parseInt(numbers) || 0;
  };
  
  const handleAmountChange = (text: string) => {
    const numericValue = parseCurrencyInput(text);
    setAmount(numericValue);
    setDisplayValue(formatCurrency(numericValue));
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setAttachment(result);
        Alert.alert('Sucesso', `Arquivo ${result.assets[0].name} selecionado`);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo');
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  const handleSubmit = async () => {
    if (!account?.accountNumber) {
      Alert.alert('Erro', 'Dados da conta não disponíveis. Tente novamente.');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido maior que zero.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await bankingApi.performTransaction(
        account.accountNumber,
        amount,
        transactionType
      );
      if (result.success) {
        await refreshAccount();
        
        const transactionTypeLabel = transactionTypeOptions.find(
          option => option.value === transactionType
        )?.label || transactionType;

        Alert.alert(
          'Sucesso',
          `${transactionTypeLabel} de ${formatCurrency(amount)} realizada com sucesso!\nNovo saldo: ${formatCurrency(result.newBalance)}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setAmount(0);
                setDisplayValue('R$ 0,00');
                setAttachment(null);
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível realizar a transação. Tente novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao realizar transação:', error);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível realizar a transação. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Nova transação',
        }}
      />
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={transactionType}
              onValueChange={handleTransactionTypeChange}
              style={styles.picker}
              prompt="Selecione o tipo de transação"
            >
              {transactionTypeOptions.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.label}>Valor</Text>
          <TextInput
            style={styles.input}
            placeholder="R$ 0,00"
            value={displayValue}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Anexo</Text>
          {attachment && !attachment.canceled ? (
            <View style={styles.attachmentContainer}>
              <Text style={styles.attachmentText}>
                {attachment.assets[0].name}
              </Text>
              <TouchableOpacity 
                style={styles.buttonOutlined} 
                onPress={handleRemoveAttachment}
              >
                <Text style={styles.buttonOutlinedText}>Remover anexo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.buttonOutlined} 
              onPress={handlePickDocument}
            >
              <Text style={styles.buttonOutlinedText}>Selecionar arquivo</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.buttonPrimary, isSubmitting && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonPrimaryText}>
              {isSubmitting ? 'Processando...' : 'Criar transação'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  attachmentContainer: {
    gap: 8,
  },
  attachmentText: {
    fontSize: 14,
    color: '#666',
  },
  buttonOutlined: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonOutlinedText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
