import { Colors } from '@/constants/Colors';

export function useThemeColor(
  props: { light?: string },
  colorName: keyof typeof Colors.light
) {
  const colorFromProps = props.light;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors.light[colorName];
  }
}
