import React from "react";
import { View, Text } from "react-native";

/** Espelha `scoreColor`/`SCORE_BANDS` de c:\ChartFM\lib\album-score.ts. */
export function scoreColor(score: number): string {
  if (score >= 90) return "#2E7D32"; // aclamado
  if (score >= 70) return "#43A047"; // recomendado
  if (score >= 50) return "#F9A825"; // misto
  if (score >= 30) return "#FB8C00"; // desfavorável
  return "#E53935"; // rejeitado
}

/** Espelha c:\ChartFM\components\ui\ScoreSquare.tsx — nota numérica em quadrado colorido. */
export function ScoreSquare({ score, size = 34 }: { score: number; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: scoreColor(score),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.4 }}>{Math.round(score)}</Text>
    </View>
  );
}
