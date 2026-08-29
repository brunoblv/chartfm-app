import React from "react";
import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useAppTheme } from "../theme/ThemeProvider";

export function OfflineBanner() {
  const { colors } = useAppTheme();
  return (
    <View style={{ backgroundColor: colors.fillInset, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }}>
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.textSubtle} strokeWidth={2} strokeLinecap="round">
        <Path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 3-2.3M19 12.5a10 10 0 0 0-3.4-2.5M12 20h.01" />
      </Svg>
      <Text style={{ fontSize: 12.5, fontWeight: "600", color: colors.textSubtle }}>Sem conexão · mostrando dados salvos</Text>
    </View>
  );
}
