import React from "react";
import { Text } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";

export function PositionNumber({ n, size = 22 }: { n: number; size?: number }) {
  const { colors } = useAppTheme();
  return (
    <Text
      style={{
        fontSize: size,
        fontWeight: "700",
        letterSpacing: -0.4,
        color: colors.text,
        minWidth: size * 1.6,
        textAlign: "right",
      }}
    >
      {n}
    </Text>
  );
}
