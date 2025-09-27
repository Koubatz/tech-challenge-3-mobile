import React from "react";
import { TouchableOpacity, View, Text as RNText } from "react-native";

interface SegmentOption {
  key: string;
  label: string;
}

interface SegmentControlProps {
  options: SegmentOption[];
  activeKey: string;
  onOptionChange: (key: string) => void;
  activeColor?: string;
  inactiveColor?: string;
  textColor?: string;
  inactiveTextColor?: string;
}

export function SegmentControl({
  options,
  activeKey,
  onOptionChange,
  activeColor = "#294FC1",
  inactiveColor = "#f3f4f6",
  textColor = "white",
  inactiveTextColor = "#6b7280",
}: SegmentControlProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: inactiveColor,
        borderRadius: 16,
        padding: 4,
      }}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={{
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 16,
            backgroundColor:
              activeKey === option.key ? activeColor : "transparent",
          }}
          onPress={() => onOptionChange(option.key)}
        >
          <RNText
            style={{
              textAlign: "center",
              fontSize: 14,
              fontWeight: "500",
              color: activeKey === option.key ? textColor : inactiveTextColor,
            }}
          >
            {option.label}
          </RNText>
        </TouchableOpacity>
      ))}
    </View>
  );
}
