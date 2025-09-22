import { Label, RadioGroup, XStack, type SizeTokens } from 'tamagui';

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
  size?: SizeTokens;
}

type RadioGroupItemWithLabelProps = {
  size: SizeTokens;
  value: string;
  label: string;
};

export function RadioGroupField({
  items,
  value,
  defaultValue,
  onValueChange,
  name = 'form',
  size = '$4'
}: RadioGroupDemoProps) {
  return (
    <RadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
    >
      <XStack gap="$4">
        {items.map((item) => (
          <RadioGroupItemWithLabel
            key={item.value}
            size={size}
            value={item.value}
            label={item.label}
          />
        ))}
      </XStack>
    </RadioGroup>
  )
}

export function RadioGroupItemWithLabel({ size, value, label }: RadioGroupItemWithLabelProps) {
  const id = `radiogroup-${value}`;

  return (
    <XStack alignItems="center" gap="$2">
      <RadioGroup.Item value={value} id={id} size={size}>
        <RadioGroup.Indicator />
      </RadioGroup.Item>
      <Label size={size} htmlFor={id}>
        {label}
      </Label>
    </XStack>
  )
}
