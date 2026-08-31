import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { WeeklyRecap, recapItemLabel } from "../../api/homeHub";

const MAX_ITEMS = 5;

export function WeeklyRecapCard({ recap, onSeeHistory }: { recap: WeeklyRecap; onSeeHistory?: () => void }) {
  const { colors } = useAppTheme();
  const items = recap.items.slice(0, MAX_ITEMS);
  const { level } = recap;

  return (
    <View
      style={{
        marginHorizontal: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 16,
        padding: 18,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 15.5, fontWeight: "800", color: colors.text }}>Sua semana no ChartFM</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
            O que aconteceu por causa da sua participação
          </Text>
        </View>
        {onSeeHistory && (
          <Pressable onPress={onSeeHistory}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: colors.accent }}>Ver histórico →</Text>
          </Pressable>
        )}
      </View>

      {items.length === 0 ? (
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 14, lineHeight: 19 }}>
          Nada aconteceu ainda nesta semana. Publique sua parada, escreva uma review ou entre numa rodada do Push.
        </Text>
      ) : (
        <View style={{ marginTop: 14, gap: 9 }}>
          {items.map((item) => (
            <View key={item.kind} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
              <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.accent, marginTop: 6 }} />
              <Text style={{ flex: 1, fontSize: 13, lineHeight: 18, color: colors.text }}>{recapItemLabel(item)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.dividerSoft }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>Level {level.level}</Text>
          {recap.xpThisWeek > 0 && (
            <Text style={{ fontSize: 12.5, fontWeight: "700", color: colors.accent }}>+{recap.xpThisWeek} XP nesta semana</Text>
          )}
        </View>
        <View style={{ height: 7, borderRadius: 4, backgroundColor: colors.fillSubtle, overflow: "hidden", marginTop: 8 }}>
          <View style={{ width: `${level.percent}%`, height: "100%", backgroundColor: colors.accent }} />
        </View>
        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>
          {level.isMaxLevel ? "Level máximo" : `faltam ${level.xpToNextLevel} XP para o Level ${level.level + 1}`}
        </Text>
      </View>
    </View>
  );
}
