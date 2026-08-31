import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useAppTheme } from "../../theme/ThemeProvider";
import { PillButton } from "../PillButton";
import { WeekStatus } from "../../api/homeHub";

export function WeekStatusCard({
  status,
  onPublish,
  onViewChart,
}: {
  status: WeekStatus;
  onPublish: () => void;
  onViewChart: () => void;
}) {
  const { colors } = useAppTheme();
  const published = Boolean(status.thisWeekChartId);

  return (
    <View style={{ marginHorizontal: 16 }}>
      <LinearGradient
        colors={[colors.gradientHero[0], colors.gradientHero[1]]}
        style={{ borderRadius: 18, padding: 20, flexDirection: "row", alignItems: "center", gap: 16 }}
      >
        <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round">
            <Path d="M3 12V9M7 12V6M11 12V3M15 12V7M19 12V5" />
          </Svg>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 11, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", color: "#fff", opacity: 0.85 }}>
            {status.paradaNome ?? "Minha parada"}
          </Text>
          <Text style={{ fontSize: 19, fontWeight: "700", letterSpacing: -0.5, color: "#fff", marginTop: 3 }}>
            {published ? "Parada publicada!" : "Hora de atualizar"}
          </Text>
          <Text style={{ fontSize: 12.5, color: "#fff", opacity: 0.88, marginTop: 4 }}>
            {published
              ? `sequência de ${status.streak}`
              : `faltam ${status.daysLeft} dia${status.daysLeft === 1 ? "" : "s"} · sequência de ${status.streak}`}
          </Text>
        </View>
      </LinearGradient>

      <View style={{ marginTop: 10 }}>
        <PillButton
          label={published ? "Ver minha parada" : "Atualizar meu Chart"}
          variant="dark"
          onPress={published ? onViewChart : onPublish}
        />
      </View>
    </View>
  );
}
