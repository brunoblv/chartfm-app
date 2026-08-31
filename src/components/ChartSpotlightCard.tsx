import React from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";
import { Cover } from "./Cover";
import { ChartSpotlightSong } from "../api/chartDetail";

export type SpotlightKind = "flashback" | "destaque" | "nacional" | "push" | "radar";

export const SPOTLIGHT_KIND_LABEL: Record<SpotlightKind, string> = {
  flashback: "Flashback",
  destaque: "Destaque",
  nacional: "Nacional",
  push: "Push",
  radar: "Radar de novidades",
};

export const SPOTLIGHT_KIND_COLOR: Record<SpotlightKind, string> = {
  flashback: "#7C3AED",
  destaque: "#DB2777",
  nacional: "#059669",
  push: "#2563EB",
  radar: "#D97706",
};

export function ChartSpotlightCard({ kind, song }: { kind: SpotlightKind; song: ChartSpotlightSong }) {
  const { colors } = useAppTheme();
  const color = SPOTLIGHT_KIND_COLOR[kind];
  const url = song.spotifyUrl ?? (song.spotifyId ? `https://open.spotify.com/track/${song.spotifyId}` : null);

  return (
    <View
      style={{
        width: 148,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 14,
        padding: 10,
      }}
    >
      <Text style={{ fontSize: 10.5, fontWeight: "700", letterSpacing: 0.4, textTransform: "uppercase", color, marginBottom: 8 }}>
        {SPOTLIGHT_KIND_LABEL[kind]}
      </Text>
      <Cover cover={song.cover} size={126} rounded={10} />
      <Text numberOfLines={2} style={{ fontSize: 12.5, fontWeight: "700", color: colors.text, marginTop: 8, minHeight: 32 }}>
        {song.title}
      </Text>
      <Text numberOfLines={1} style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
        {song.artist}
      </Text>
      {url ? (
        <Pressable onPress={() => Linking.openURL(url)} style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: colors.accent }}>Abrir no Spotify</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
