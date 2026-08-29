import React from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.divider,
          borderRadius: 16,
          overflow: "hidden",
          marginHorizontal: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
