import React from "react";
import { Pressable, View } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onToggle}
      style={{
        width: 46,
        height: 28,
        borderRadius: 100,
        backgroundColor: on ? colors.accent : colors.dividerStrong,
        padding: 3,
        justifyContent: "center",
        alignItems: on ? "flex-end" : "flex-start",
      }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff" }} />
    </Pressable>
  );
}
