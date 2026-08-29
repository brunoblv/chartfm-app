import React from "react";
import { View, Text, TextInput } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";

export function AuthField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  placeholder?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12.5, fontWeight: "600", color: colors.textSubtle }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: colors.dividerStrong,
          backgroundColor: colors.surface,
          color: colors.text,
          fontSize: 15,
          paddingVertical: 14,
          paddingHorizontal: 15,
          borderRadius: 12,
        }}
      />
    </View>
  );
}
