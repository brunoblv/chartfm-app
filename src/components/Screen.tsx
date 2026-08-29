import React from "react";
import { View, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";

export function Screen({
  children,
  scroll = true,
  edges = ["top"],
}: {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
}) {
  const { colors, theme } = useAppTheme();
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
      <Body style={{ flex: 1 }} contentContainerStyle={scroll ? { paddingBottom: 24 } : undefined}>
        {children}
      </Body>
    </SafeAreaView>
  );
}
