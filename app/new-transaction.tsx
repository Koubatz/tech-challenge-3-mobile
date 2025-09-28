import * as DocumentPicker from 'expo-document-picker';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Button, Form, Input, Text, YStack } from 'tamagui';

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
      <YStack padding="$4" gap="$4">
        <Form onSubmit={handleSubmit}>
          <YStack gap="$4">
            <Text>Tipo</Text>
            <RadioGroupField
              items={transactionTypeOptions}
              value={transactionType}
              onValueChange={handleTransactionTypeChange}
            />
            <Text>Valor</Text>
            <Input
              placeholder="R$ 0,00"
              value={displayValue}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
            />
            <Text>Anexo</Text>
            {attachment && !attachment.canceled ? (
              <YStack gap="$2">
                <Text fontSize="$3">
                  {attachment.assets[0].name}
                </Text>
                <Button 
                  variant="outlined" 
                  onPress={handleRemoveAttachment}
                >
                  Remover anexo
                </Button>
              </YStack>
            ) : (
              <Button 
                variant="outlined" 
                onPress={handlePickDocument}
              >
                Selecionar arquivo
              </Button>
            )}
            <Form.Trigger asChild>
              <Button themeInverse>
                Criar transação
              </Button>
            </Form.Trigger>
          </YStack>
        </Form>
      </YStack>
    </>
  );
}
