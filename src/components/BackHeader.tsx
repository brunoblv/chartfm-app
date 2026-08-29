import React from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";

export function BackHeader({ title, action }: { title?: string; action?: React.ReactNode }) {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
      <Pressable
        onPress={() => navigation.goBack()}
        style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
      >
        <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round">
          <Path d="M15 18l-6-6 6-6" />
        </Svg>
      </Pressable>
      {title ? (
        <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text, flex: 1 }}>{title}</Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {action}
    </View>
  );
}
