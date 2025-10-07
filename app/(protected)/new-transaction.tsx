import * as DocumentPicker from 'expo-document-picker';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { RadioGroupField } from '@/components/RadioGroupField';
import type { TransactionLabel, TransactionType } from '@/types/transactions';
import { formatCurrency } from '@/utils/currency';

type TransactionOption = {
  value: TransactionType;
  label: TransactionLabel;
};

const transactionTypeOptions: TransactionOption[] = [
  {
    value: 'credit',
    label: 'Crédito',
  },
  {
    value: 'debit',
    label: 'Débito',
  },
];

export default function NewTransaction() {
  const [transactionType, setTransactionType] = useState<TransactionType>();
  const [amount, setAmount] = useState<number>(0);
  const [displayValue, setDisplayValue] = useState<string>('R$ 0,00');
  const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerResult | null>(null);

  const handleTransactionTypeChange = (value: string) => {
    setTransactionType(value as TransactionType);
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

  const handleSubmit = () => {
    // TODO: Implementar lógica de criação de transação
    console.log("Transação criada!");
    console.log("Transação criada!", {
      transactionType,
      amount,
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nova transação',
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.label}>Tipo</Text>
          <RadioGroupField
            items={transactionTypeOptions}
            value={transactionType}
            onValueChange={handleTransactionTypeChange}
          />
          
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
            style={styles.buttonPrimary} 
            onPress={handleSubmit}
          >
            <Text style={styles.buttonPrimaryText}>Criar transação</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    gap: 16,
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
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
