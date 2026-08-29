import React from "react";
import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useAppTheme } from "../theme/ThemeProvider";

export type MovementStatus = "new" | "return" | "same" | "up" | "down";

export function MovementBadge({
  status,
  delta,
  compact = false,
}: {
  status: MovementStatus;
  delta?: number;
  compact?: boolean;
}) {
  const { colors } = useAppTheme();
  const base = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
    paddingVertical: compact ? 1 : 2,
    paddingHorizontal: compact ? 5 : 7,
    borderRadius: 6,
    alignSelf: "flex-start" as const,
  };
  const fontSize = compact ? 10 : 11;
  const sz = compact ? 9 : 10;

  if (status === "new") {
    return (
      <View style={[base, { backgroundColor: colors.newBg }]}>
        <Text style={{ color: colors.newFg, fontSize, fontWeight: "600" }}>NOVA</Text>
      </View>
    );
  }
  if (status === "return") {
    return (
      <View style={[base, { backgroundColor: "#111827" }]}>
        <Text style={{ color: "#fff", fontSize, fontWeight: "600" }}>RETORNO</Text>
      </View>
    );
  }
  if (status === "same") {
    return (
      <View style={[base, { backgroundColor: colors.sameBg }]}>
        <Text style={{ color: colors.sameFg, fontSize, fontWeight: "600" }}>—</Text>
      </View>
    );
  }
  if (status === "up") {
    return (
      <View style={[base, { backgroundColor: colors.upBg }]}>
        <Svg width={sz} height={sz} viewBox="0 0 10 10">
          <Path d="M5 1 L9 8 L1 8 Z" fill={colors.upFg} />
        </Svg>
        <Text style={{ color: colors.upFg, fontSize, fontWeight: "600" }}>{delta}</Text>
      </View>
    );
  }
  if (status === "down") {
    return (
      <View style={[base, { backgroundColor: colors.downBg }]}>
        <Svg width={sz} height={sz} viewBox="0 0 10 10">
          <Path d="M5 9 L1 2 L9 2 Z" fill={colors.downFg} />
        </Svg>
        <Text style={{ color: colors.downFg, fontSize, fontWeight: "600" }}>
          {Math.abs(delta ?? 0)}
        </Text>
      </View>
    );
  }
  return null;
}
