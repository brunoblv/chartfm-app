import React from "react";
import { Pressable, Text, ViewStyle, StyleProp } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";

type Variant = "accent" | "dark" | "ghost" | "white";

export function PillButton({
  label,
  onPress,
  variant = "accent",
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
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
      style={[
        {
          backgroundColor: bg,
          borderRadius: 100,
          paddingVertical: 15,
          alignItems: "center",
          borderWidth: variant === "ghost" ? 1 : 0,
          borderColor,
        },
        style,
      ]}
    >
      <Text style={{ color: fg, fontSize: 16, fontWeight: "700", letterSpacing: -0.2 }}>{label}</Text>
    </Pressable>
  );
}
