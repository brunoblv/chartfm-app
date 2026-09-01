import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";
import { MovementBadge, MovementStatus } from "./MovementBadge";
import { ProfileChart } from "../api/profile";
import { resolveMediaUrl } from "../lib/api";

export function ParadaChartCard({
  chart,
  onEditPress,
  onSeeAllPress,
  onPressEntry,
  onPressArtist,
  limit = 10,
}: {
  chart: ProfileChart;
  onEditPress?: () => void;
  onSeeAllPress?: () => void;
  onPressEntry: (songId: string, spotifyId?: string | null) => void;
  onPressArtist?: (artistId: number) => void;
  limit?: number;
}) {
  const { colors } = useAppTheme();
  const entries = chart.entries.slice(0, limit);

  return (
    <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, padding: 14, paddingBottom: 10 }}>
        <Text style={{ flex: 1, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted }}>
          {chart.weekLabel}
        </Text>
        {onEditPress && (
          <Pressable onPress={onEditPress}>
            <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "700" }}>Editar</Text>
          </Pressable>
        )}
      </View>
      {entries.map((e, i) => (
        <Pressable
          key={`${e.position}-${e.song.title}`}
          onPress={() => onPressEntry(e.song.id, e.song.spotifyId)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingVertical: 9,
            paddingHorizontal: 14,
            borderBottomWidth: i === entries.length - 1 ? 0 : 1,
            borderBottomColor: colors.dividerSoft,
          }}
        >
          <Text style={{ width: 20, fontSize: 13, fontWeight: "800", color: colors.textMuted }}>{e.position}</Text>
          {e.song.imageUrl ? (
            <Image source={{ uri: resolveMediaUrl(e.song.imageUrl) }} style={{ width: 36, height: 36, borderRadius: 8 }} />
          ) : (
            <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.fillSubtle }} />
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text }}>
              {e.song.title}
            </Text>
            {onPressArtist && e.song.artistRefId != null ? (
              <Pressable onPress={() => onPressArtist(e.song.artistRefId!)} hitSlop={4}>
                <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted }}>
                  {e.song.artist}
                </Text>
              </Pressable>
            ) : (
              <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted }}>
                {e.song.artist}
              </Text>
            )}
            <Text style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 1 }}>
              {e.weeks} {e.weeks === 1 ? "sem" : "sems"} · pico #{e.peak}
            </Text>
          </View>
          <MovementBadge status={e.status as MovementStatus} delta={e.delta ?? undefined} compact />
        </Pressable>
      ))}
      {chart.entries.length > limit && onSeeAllPress && (
        <Pressable
          onPress={onSeeAllPress}
          style={{ paddingVertical: 13, alignItems: "center", borderTopWidth: 1, borderTopColor: colors.dividerSoft }}
        >
          <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 13 }}>
            Ver todas as {chart.entries.length} músicas
          </Text>
        </Pressable>
      )}
    </View>
  );
}
