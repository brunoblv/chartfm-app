import React from "react";
import { ActivityIndicator, Pressable, Text, ViewStyle, StyleProp } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";

type Variant = "accent" | "dark" | "ghost" | "white";

export function PillButton({
  label,
  onPress,
  variant = "accent",
  style,
  disabled,
  loading,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  loading?: boolean;
}) {
  const { colors } = useAppTheme();

  const bg =
    variant === "accent"
      ? colors.accent
      : variant === "dark"
      ? colors.btnDarkBg
      : variant === "white"
      ? "#fff"
      : "transparent";
  const fg =
    variant === "accent"
      ? "#fff"
      : variant === "dark"
      ? colors.btnDarkFg
      : variant === "white"
      ? colors.accent
      : colors.accent;
  const borderColor = variant === "ghost" ? colors.dividerStrong : "transparent";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: bg,
          borderRadius: 100,
          paddingVertical: 15,
          alignItems: "center",
          borderWidth: variant === "ghost" ? 1 : 0,
          borderColor,
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={{ color: fg, fontSize: 16, fontWeight: "700", letterSpacing: -0.2 }}>{label}</Text>
      )}
    </Pressable>
  );
}
