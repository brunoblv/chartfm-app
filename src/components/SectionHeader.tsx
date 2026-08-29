import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "baseline",
        gap: 8,
        paddingHorizontal: 20,
        paddingTop: 26,
        paddingBottom: 12,
      }}
    >
      <Text style={{ flex: 1, fontSize: 19, fontWeight: "800", letterSpacing: -0.4, color: colors.text }}>
        {title}
      </Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.accent }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
