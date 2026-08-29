import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Path, Line } from "react-native-svg";
import { useAppTheme } from "../theme/ThemeProvider";
import { PillButton } from "./PillButton";

export function ErrorState({ onRetry, reference = "b74a1" }: { onRetry?: () => void; reference?: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.downBg, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.downFg} strokeWidth={2} strokeLinecap="round">
          <Line x1={12} y1={8} x2={12} y2={13} />
          <Circle cx={12} cy={16.2} r={0.4} fill={colors.downFg} />
          <Circle cx={12} cy={12} r={9} />
        </Svg>
      </View>
      <Text style={{ fontSize: 19, fontWeight: "800", letterSpacing: -0.4, color: colors.text }}>Algo deu errado</Text>
      <Text style={{ fontSize: 13.5, color: colors.textMuted, lineHeight: 19, marginTop: 8, textAlign: "center", maxWidth: 260 }}>
        Não conseguimos carregar este conteúdo agora. Isso costuma se resolver tentando de novo.
      </Text>
      <PillButton label="Tentar de novo" onPress={onRetry} style={{ marginTop: 22, paddingHorizontal: 32, alignSelf: "center" }} />
      <Text style={{ marginTop: 10, fontSize: 12.5, color: colors.textDisabled }}>Erro 503 · ref {reference}</Text>
    </View>
  );
}
