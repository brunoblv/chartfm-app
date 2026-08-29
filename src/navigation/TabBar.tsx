import React from "react";
import { View, Pressable, Text } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";

const icons: Record<string, (color: string) => React.ReactNode> = {
  Home: (color) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round">
      <Path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Path d="M9 22V12h6v10" />
    </Svg>
  ),
  Discover: (color) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round">
      <Path d="M12 3l1.9 4.8L18.7 9.7l-4.8 1.9L12 16.4l-1.9-4.8L5.3 9.7l4.8-1.9z" />
      <Path d="M18.5 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z" />
    </Svg>
  ),
  Events: (color) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round">
      <Path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z" />
      <Path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
    </Svg>
  ),
  Profile: (color) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Path d="M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </Svg>
  ),
};

const labels: Record<string, string> = {
  Home: "Home",
  Discover: "Discover",
  Events: "Eventos",
  Profile: "Eu",
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.bgTopbar,
        borderTopWidth: 0.5,
        borderTopColor: colors.divider,
        paddingBottom: Math.max(insets.bottom, 8),
      }}
    >
      {state.routes.map((route, index) => {
        const isCreate = route.name === "Create";
        const focused = state.index === index;
        const color = focused ? colors.accent : colors.textMuted;

        if (isCreate) {
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 6 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: colors.accent,
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                }}
              >
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round">
                  <Path d="M12 5v14M5 12h14" />
                </Svg>
              </View>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 10, minHeight: 56 }}
          >
            {icons[route.name]?.(color)}
            <Text style={{ fontSize: 10, fontWeight: "600", color }}>{labels[route.name] ?? route.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
