import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Image } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { useSearchQuery, SearchSong } from "../api/search";
import type { ChartSong } from "../data/mock";
import { resolveMediaUrl } from "../lib/api";

function songToChartSong(song: SearchSong, seed: number): ChartSong {
  return {
    t: song.title,
    a: song.artist,
    album: song.album,
    spotifyId: song.spotifyId,
    songId: song.id,
    cover: { palette: ["#1D1D1F", "#5B5B60"], seed, imageUrl: song.coverUrl ?? undefined },
  };
}

export function AddSongScreen() {
  const { colors } = useAppTheme();
  const { chart, addSong } = useAppState();
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const { data, isLoading } = useSearchQuery(query);
  const results = data?.songs ?? [];

  return (
    <View style={{ flex: 1 }}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} onPress={() => navigation.goBack()} />
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          top: 64,
          backgroundColor: colors.surfaceElevated,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderTopWidth: 0.5,
          borderTopColor: colors.divider,
        }}
      >
        <View style={{ alignItems: "center", paddingVertical: 10 }}>
          <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: colors.dividerStrong }} />
        </View>
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>Adicionar música</Text>
          <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.fillSubtle, borderRadius: 12, padding: 13 }}>
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2} strokeLinecap="round">
              <Circle cx={11} cy={11} r={7} />
              <Path d="M20 20l-3.5-3.5" />
            </Svg>
            <TextInput
              value={query}
              onChangeText={setQuery}
              autoFocus
              placeholder="buscar música ou artista"
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, fontSize: 14.5, fontWeight: "600", color: colors.text, padding: 0 }}
            />
          </View>
        </View>
        <ScrollView>
          {query.trim().length < 2 ? (
            <Text style={{ paddingHorizontal: 20, fontSize: 13, color: colors.textMuted }}>
              Digite pelo menos 2 letras para buscar.
            </Text>
          ) : isLoading ? (
            <ActivityIndicator color={colors.text} style={{ marginTop: 20 }} />
          ) : (
            <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
              {results.map((song, i) => {
                const added = chart.some((r) => r.songId === song.id || r.t === song.title);
                return (
                  <Pressable
                    key={song.id}
                    onPress={() => !added && addSong(songToChartSong(song, i))}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      paddingVertical: 11,
                      paddingHorizontal: 14,
                      borderBottomWidth: i === results.length - 1 ? 0 : 1,
                      borderBottomColor: colors.dividerSoft,
                    }}
                  >
                    {song.coverUrl ? (
                      <Image source={{ uri: resolveMediaUrl(song.coverUrl) }} style={{ width: 44, height: 44, borderRadius: 10 }} />
                    ) : (
                      <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: colors.fillSubtle }} />
                    )}
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                        {song.title}
                      </Text>
                      <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
                        {song.artist}
                      </Text>
                    </View>
                    {added ? (
                      <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.upFg} strokeWidth={2.4} strokeLinecap="round">
                        <Path d="M20 6 9 17l-5-5" />
                      </Svg>
                    ) : (
                      <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
                        <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={3} strokeLinecap="round">
                          <Path d="M12 5v14M5 12h14" />
                        </Svg>
                      </View>
                    )}
                  </Pressable>
                );
              })}
              {results.length === 0 && (
                <Text style={{ padding: 16, fontSize: 13, color: colors.textMuted }}>Nenhuma música encontrada.</Text>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
