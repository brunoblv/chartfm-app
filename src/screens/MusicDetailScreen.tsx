import React from "react";
import { View, Text, Pressable, ScrollView, Image, ActivityIndicator } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { ScoreSquare } from "../components/ScoreSquare";
import { resolveMediaUrl } from "../lib/api";
import { useSongQuery } from "../api/song";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "MusicDetail">;

export function MusicDetailScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const songId = route.params?.songId;
  const songQuery = useSongQuery(songId);
  const song = songQuery.data;

  if (!songId) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader />
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>Música não encontrada.</Text>
      </View>
    );
  }

  if (songQuery.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader />
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      </View>
    );
  }

  if (!song) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader />
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>
          Não foi possível carregar essa música.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackHeader />

      <View style={{ alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18 }}>
        {song.coverUrl ? (
          <Image source={{ uri: resolveMediaUrl(song.coverUrl) }} style={{ width: 176, height: 176, borderRadius: 20 }} />
        ) : (
          <View style={{ width: 176, height: 176, borderRadius: 20, backgroundColor: colors.fillSubtle }} />
        )}
        <Text style={{ fontSize: 23, fontWeight: "800", letterSpacing: -0.5, color: colors.text, marginTop: 18, textAlign: "center" }}>
          {song.title}
        </Text>
        <Text style={{ fontSize: 15, color: colors.textMuted, marginTop: 4 }}>{song.artist}</Text>
        {song.albumTitle ? (
          <Pressable
            disabled={song.albumId == null}
            onPress={() => song.albumId != null && navigation.navigate("AlbumDetail", { albumId: song.albumId })}
          >
            <Text style={{ fontSize: 13, color: colors.accent, marginTop: 2 }}>{song.albumTitle}</Text>
          </Pressable>
        ) : null}
        {song.globalStats.weeks > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
            <Text style={{ fontSize: 12.5, color: colors.textMuted }}>
              {song.globalStats.weeks} {song.globalStats.weeks === 1 ? "semana" : "semanas"} no Global 100 · pico #{song.globalStats.peak}
              {song.globalStats.numberOnes > 0 ? ` · ${song.globalStats.numberOnes}x #1` : ""}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 16 }}>
        <Pressable style={{ flex: 1, backgroundColor: colors.accent, borderRadius: 100, paddingVertical: 14, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14.5 }}>+ Adicionar à minha parada</Text>
        </Pressable>
        <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.dividerStrong, alignItems: "center", justifyContent: "center" }}>
          <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={1.8} strokeLinecap="round">
            <Path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
            <Path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
          </Svg>
        </View>
      </View>

      {song.albumScore ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, marginTop: 26, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 16 }}>
          <ScoreSquare score={song.albumScore.score} size={40} />
          <Text style={{ flex: 1, fontSize: 13, color: colors.textSubtle }}>
            Nota do álbum na crítica, com base em {song.albumScore.reviewCount}{" "}
            {song.albumScore.reviewCount === 1 ? "review" : "reviews"}.
          </Text>
        </View>
      ) : null}

      {song.editorialNote ? (
        <View style={{ marginHorizontal: 16, marginTop: 26 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.4, color: colors.text, marginBottom: 10 }}>
            Contexto
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textSubtle }}>{song.editorialNote}</Text>
        </View>
      ) : null}

      {song.genres.length > 0 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginHorizontal: 16, marginTop: 20 }}>
          {song.genres.map((g) => (
            <View key={g} style={{ backgroundColor: colors.fillSubtle, borderRadius: 100, paddingVertical: 6, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>{g}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
