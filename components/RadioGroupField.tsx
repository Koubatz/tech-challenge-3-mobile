import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type RadioItem = {
  value: string;
  label: string;
}

type RadioGroupDemoProps = {
  items: RadioItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

type RadioGroupItemWithLabelProps = {
  value: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

export function RadioGroupField({
  items,
  value,
  defaultValue,
  onValueChange,
  name = 'form'
}: RadioGroupDemoProps) {
  const currentValue = value || defaultValue;

  const handlePress = (itemValue: string) => {
    if (onValueChange) {
      onValueChange(itemValue);
    }
  };

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <RadioGroupItemWithLabel
          key={item.value}
          value={item.value}
          label={item.label}
          isSelected={currentValue === item.value}
          onPress={() => handlePress(item.value)}
        />
      ))}
    </View>
  );
}

export function RadioGroupItemWithLabel({ 
  value, 
  label, 
  isSelected, 
  onPress 
}: RadioGroupItemWithLabelProps) {
  return (
    <TouchableOpacity style={styles.radioItem} onPress={onPress}>
      <View style={styles.radioButton}>
        {isSelected && <View style={styles.radioButtonSelected} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
});
