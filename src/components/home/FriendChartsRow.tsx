import React from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../../theme/ThemeProvider";
import { FriendChart } from "../../api/homeHub";
import { resolveMediaUrl } from "../../lib/api";

export function FriendChartsRow({ charts, onPress }: { charts: FriendChart[]; onPress: (handle: string) => void }) {
  const { colors } = useAppTheme();
  if (charts.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
      {charts.map((c) => (
        <Pressable
          key={c.chartId}
          onPress={() => onPress(c.authorHandle)}
          style={{
            width: 210,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.divider,
            borderRadius: 16,
            padding: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
            {c.authorImage ? (
              <Image source={{ uri: resolveMediaUrl(c.authorImage) }} style={{ width: 30, height: 30, borderRadius: 15 }} />
            ) : (
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c.authorColor, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>{c.authorName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                {c.authorName}
              </Text>
              {c.commonGenres && c.commonGenres.length > 0 && (
                <Text style={{ fontSize: 10.5, color: colors.textMuted }}>{c.commonGenres.length} gêneros em comum</Text>
              )}
            </View>
          </View>
          <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text, marginTop: 10 }}>
            {c.paradaNome}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
            {c.weekLabel}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
