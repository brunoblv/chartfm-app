import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, Image } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useAppTheme } from "../theme/ThemeProvider";
import { useSearchQuery, SearchSong } from "../api/search";
import { resolveMediaUrl } from "../lib/api";
import { SpotlightSong } from "../state/AppState";
import { SpotlightKind, SPOTLIGHT_KIND_LABEL, SPOTLIGHT_KIND_COLOR } from "./ChartSpotlightCard";

const KIND_HELPER: Record<SpotlightKind, string> = {
  flashback: "Uma música do passado para relembrar.",
  destaque: "A música que mais te marcou nesta parada.",
  nacional: "Só músicas de artistas nacionais elegíveis.",
  push: "Uma música que você quer empurrar para mais gente ouvir.",
  radar: "Uma novidade recente que vale a pena descobrir.",
};

function songToSpotlight(song: SearchSong): SpotlightSong {
  return {
    title: song.title,
    artist: song.artist,
    spotifyId: song.spotifyId,
    songId: song.id,
    cover: { palette: ["#1D1D1F", "#5B5B60"], seed: song.id.length, imageUrl: song.coverUrl ?? undefined },
  };
}

export function SpotlightPickerRow({
  kind,
  value,
  onChange,
}: {
  kind: SpotlightKind;
  value: SpotlightSong | null | undefined;
  onChange: (song: SpotlightSong | null) => void;
}) {
  const { colors } = useAppTheme();
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const { data, isLoading } = useSearchQuery(searching ? query : "");
  const results = data?.songs ?? [];
  const color = SPOTLIGHT_KIND_COLOR[kind];

  return (
    <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 14, padding: 12, marginBottom: 10 }}>
      <Text style={{ fontSize: 12.5, fontWeight: "700", color }}>{SPOTLIGHT_KIND_LABEL[kind]}</Text>
      <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{KIND_HELPER[kind]}</Text>

      {value ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 }}>
          {value.cover.imageUrl ? (
            <Image source={{ uri: resolveMediaUrl(value.cover.imageUrl) }} style={{ width: 40, height: 40, borderRadius: 8 }} />
          ) : (
            <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colors.fillSubtle }} />
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text }}>
              {value.title}
            </Text>
            <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted }}>
              {value.artist}
            </Text>
          </View>
          <Pressable onPress={() => onChange(null)} style={{ width: 28, height: 28, alignItems: "center", justifyContent: "center" }}>
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={colors.textDisabled} strokeWidth={2.2} strokeLinecap="round">
              <Path d="M18 6 6 18M6 6l12 12" />
            </Svg>
          </Pressable>
        </View>
      ) : searching ? (
        <View style={{ marginTop: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.fillSubtle, borderRadius: 10, padding: 10 }}>
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2} strokeLinecap="round">
              <Circle cx={11} cy={11} r={7} />
              <Path d="M20 20l-3.5-3.5" />
            </Svg>
            <TextInput
              value={query}
              onChangeText={setQuery}
              autoFocus
              placeholder="buscar música ou artista"
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, fontSize: 13.5, fontWeight: "600", color: colors.text, padding: 0 }}
            />
            <Pressable onPress={() => { setSearching(false); setQuery(""); }}>
              <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: "600" }}>Cancelar</Text>
            </Pressable>
          </View>
          {query.trim().length >= 2 ? (
            isLoading ? (
              <ActivityIndicator color={colors.text} style={{ marginTop: 10 }} />
            ) : (
              <View style={{ marginTop: 8 }}>
                {results.slice(0, 6).map((song) => (
                  <Pressable
                    key={song.id}
                    onPress={() => {
                      onChange(songToSpotlight(song));
                      setSearching(false);
                      setQuery("");
                    }}
                    style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 }}
                  >
                    {song.coverUrl ? (
                      <Image source={{ uri: resolveMediaUrl(song.coverUrl) }} style={{ width: 34, height: 34, borderRadius: 7 }} />
                    ) : (
                      <View style={{ width: 34, height: 34, borderRadius: 7, backgroundColor: colors.fillSubtle }} />
                    )}
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>
                        {song.title}
                      </Text>
                      <Text numberOfLines={1} style={{ fontSize: 11, color: colors.textMuted }}>
                        {song.artist}
                      </Text>
                    </View>
                  </Pressable>
                ))}
                {results.length === 0 ? (
                  <Text style={{ fontSize: 12, color: colors.textMuted, paddingVertical: 6 }}>Nenhuma música encontrada.</Text>
                ) : null}
              </View>
            )
          ) : null}
        </View>
      ) : (
        <Pressable onPress={() => setSearching(true)} style={{ marginTop: 10, alignSelf: "flex-start" }}>
          <Text style={{ fontSize: 12.5, fontWeight: "700", color: colors.accent }}>+ Buscar música</Text>
        </Pressable>
      )}
    </View>
  );
}
