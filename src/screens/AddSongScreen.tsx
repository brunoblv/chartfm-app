import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Image } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { useSearchQuery, useSpotifyTrackSearch, SearchSong, SpotifySearchTrack } from "../api/search";
import { useGlobalSongsQuery } from "../api/global";
import type { ChartSong } from "../data/mock";
import { sameChartSong } from "../data/mock";
import { resolveMediaUrl } from "../lib/api";

function catalogToChartSong(song: SearchSong, seed: number): ChartSong {
  return {
    t: song.title,
    a: song.artist,
    album: song.album,
    spotifyId: song.spotifyId,
    songId: song.id,
    cover: { palette: ["#1D1D1F", "#5B5B60"], seed, imageUrl: song.coverUrl ?? undefined },
  };
}

function spotifyToChartSong(song: SpotifySearchTrack, seed: number): ChartSong {
  return {
    t: song.title,
    a: song.artist,
    album: song.album,
    spotifyId: song.spotifyId,
    cover: { palette: ["#1D1D1F", "#5B5B60"], seed, imageUrl: song.imageUrl ?? undefined },
  };
}

function ResultRow({
  title,
  artist,
  coverUrl,
  added,
  last,
  onPress,
}: {
  title: string;
  artist: string;
  coverUrl?: string | null;
  added: boolean;
  last: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={() => !added && onPress()}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 11,
        paddingHorizontal: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.dividerSoft,
        opacity: added ? 0.7 : 1,
      }}
    >
      {coverUrl ? (
        <Image source={{ uri: resolveMediaUrl(coverUrl) }} style={{ width: 44, height: 44, borderRadius: 10 }} />
      ) : (
        <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: colors.fillSubtle }} />
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
          {title}
        </Text>
        <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
          {artist}
        </Text>
      </View>
      {added ? (
        <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.upFg} strokeWidth={2.4} strokeLinecap="round">
          <Path d="M20 6 9 17l-5-5" />
        </Svg>
      ) : (
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            borderWidth: 1.5,
            borderColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={3} strokeLinecap="round">
            <Path d="M12 5v14M5 12h14" />
          </Svg>
        </View>
      )}
    </Pressable>
  );
}

function SectionLabel({ children }: { children: string }) {
  const { colors } = useAppTheme();
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.6,
        textTransform: "uppercase",
        color: colors.textMuted,
        paddingHorizontal: 4,
        marginBottom: 8,
        marginTop: 4,
      }}
    >
      {children}
    </Text>
  );
}

export function AddSongScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { chart, addSong } = useAppState();
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const catalogQuery = useSearchQuery(query);
  const spotifyQuery = useSpotifyTrackSearch(query);
  const globalQuery = useGlobalSongsQuery("weekly");

  const catalogSongs = catalogQuery.data?.songs ?? [];
  const spotifyTracks = useMemo(() => {
    const tracks = spotifyQuery.data?.tracks ?? [];
    return tracks.filter((t) => {
      const alreadyInCatalog = catalogSongs.some(
        (s) =>
          (s.spotifyId && s.spotifyId === t.spotifyId) ||
          (s.title.toLowerCase() === t.title.toLowerCase() && s.artist.toLowerCase() === t.artist.toLowerCase())
      );
      return !alreadyInCatalog;
    });
  }, [spotifyQuery.data?.tracks, catalogSongs]);

  const suggestions = (globalQuery.data?.items ?? []).slice(0, 8);
  const searching = query.trim().length >= 2;
  const loading = searching && (catalogQuery.isLoading || spotifyQuery.isLoading);
  const empty =
    searching &&
    !loading &&
    catalogSongs.length === 0 &&
    spotifyTracks.length === 0;

  const isAdded = (song: ChartSong) => chart.some((row) => sameChartSong(row, song));

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
        <View style={{ paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "center" }}>
          <Text style={{ flex: 1, fontSize: 17, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>
            Adicionar música
          </Text>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: colors.accent }}>Pronto</Text>
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 9,
              backgroundColor: colors.fillSubtle,
              borderRadius: 12,
              padding: 13,
            }}
          >
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2} strokeLinecap="round">
              <Circle cx={11} cy={11} r={7} />
              <Path d="M20 20l-3.5-3.5" />
            </Svg>
            <TextInput
              value={query}
              onChangeText={setQuery}
              autoFocus
              placeholder="Buscar no catálogo ou no Spotify"
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, fontSize: 14.5, fontWeight: "600", color: colors.text, padding: 0 }}
            />
          </View>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
          {!searching ? (
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 14, paddingHorizontal: 4 }}>
                Digite para buscar no catálogo do ChartFM e no Spotify. A música entra na parada; você reordena no
                editor.
              </Text>
              {suggestions.length > 0 ? (
                <>
                  <SectionLabel>Mais ouvidas no Global 100</SectionLabel>
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.divider,
                      borderRadius: 16,
                      overflow: "hidden",
                    }}
                  >
                    {suggestions.map((item, i) => {
                      const song: ChartSong = {
                        t: item.title,
                        a: item.artist,
                        album: item.album,
                        spotifyId: item.spotifyId,
                        songId: item.id ?? undefined,
                        cover: { palette: ["#1D1D1F", "#5B5B60"], seed: i, imageUrl: item.coverUrl ?? undefined },
                      };
                      return (
                        <ResultRow
                          key={item.id ?? item.spotifyId ?? `${item.title}-${i}`}
                          title={item.title}
                          artist={item.artist}
                          coverUrl={item.coverUrl}
                          added={isAdded(song)}
                          last={i === suggestions.length - 1}
                          onPress={() => addSong(song)}
                        />
                      );
                    })}
                  </View>
                </>
              ) : null}
            </View>
          ) : loading ? (
            <ActivityIndicator color={colors.text} style={{ marginTop: 20 }} />
          ) : empty ? (
            <Text style={{ paddingHorizontal: 20, fontSize: 13, color: colors.textMuted }}>Nenhuma música encontrada.</Text>
          ) : (
            <View style={{ paddingHorizontal: 16, gap: 16 }}>
              {catalogSongs.length > 0 ? (
                <View>
                  <SectionLabel>Catálogo</SectionLabel>
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.divider,
                      borderRadius: 16,
                      overflow: "hidden",
                    }}
                  >
                    {catalogSongs.map((song, i) => {
                      const mapped = catalogToChartSong(song, i);
                      return (
                        <ResultRow
                          key={song.id}
                          title={song.title}
                          artist={song.artist}
                          coverUrl={song.coverUrl}
                          added={isAdded(mapped)}
                          last={i === catalogSongs.length - 1}
                          onPress={() => addSong(mapped)}
                        />
                      );
                    })}
                  </View>
                </View>
              ) : null}
              {spotifyTracks.length > 0 ? (
                <View>
                  <SectionLabel>Spotify</SectionLabel>
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.divider,
                      borderRadius: 16,
                      overflow: "hidden",
                    }}
                  >
                    {spotifyTracks.map((song, i) => {
                      const mapped = spotifyToChartSong(song, i);
                      return (
                        <ResultRow
                          key={song.spotifyId}
                          title={song.title}
                          artist={song.artist}
                          coverUrl={song.imageUrl}
                          added={isAdded(mapped)}
                          last={i === spotifyTracks.length - 1}
                          onPress={() => addSong(mapped)}
                        />
                      );
                    })}
                  </View>
                </View>
              ) : spotifyQuery.data?.unavailable ? (
                <Text style={{ fontSize: 13, color: colors.textMuted, paddingHorizontal: 4 }}>
                  {spotifyQuery.data.error ?? "Spotify indisponível no momento. Tente de novo em alguns minutos."}
                </Text>
              ) : null}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
