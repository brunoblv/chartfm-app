import React from "react";
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { ScoreSquare } from "../components/ScoreSquare";
import { resolveMediaUrl } from "../lib/api";
import { useAlbumQuery } from "../api/album";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "AlbumDetail">;

export function AlbumDetailScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const albumId = route.params?.albumId;
  const albumQuery = useAlbumQuery(albumId);
  const album = albumQuery.data;

  if (albumId == null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader />
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>Álbum não encontrado.</Text>
      </View>
    );
  }

  if (albumQuery.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader />
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      </View>
    );
  }

  if (!album) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader />
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>
          Não foi possível carregar esse álbum.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackHeader />

      <View style={{ alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18 }}>
        {album.coverUrl ? (
          <Image source={{ uri: resolveMediaUrl(album.coverUrl) }} style={{ width: 176, height: 176, borderRadius: 20 }} />
        ) : (
          <View style={{ width: 176, height: 176, borderRadius: 20, backgroundColor: colors.fillSubtle }} />
        )}
        <Text style={{ fontSize: 23, fontWeight: "800", letterSpacing: -0.5, color: colors.text, marginTop: 18, textAlign: "center" }}>
          {album.title}
        </Text>
        <Text style={{ fontSize: 15, color: colors.textMuted, marginTop: 4 }}>
          {album.artist}
          {album.releaseYear ? ` · ${album.releaseYear}` : ""}
        </Text>
      </View>

      {album.reception ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 16 }}>
          <ScoreSquare score={album.reception.score} size={40} />
          <Text style={{ flex: 1, fontSize: 13, color: colors.textSubtle }}>
            Nota da crítica, com base em {album.reception.reviewCount}{" "}
            {album.reception.reviewCount === 1 ? "review" : "reviews"}.
          </Text>
        </View>
      ) : null}

      <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.4, color: colors.text, paddingHorizontal: 20, paddingTop: 26, paddingBottom: 12 }}>
        Faixas
      </Text>
      <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
        {album.songs.map((s, i) => (
          <Pressable
            key={s.songId}
            onPress={() => navigation.navigate("MusicDetail", { songId: s.songId, spotifyId: s.spotifyId ?? undefined })}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderBottomWidth: i === album.songs.length - 1 ? 0 : 1,
              borderBottomColor: colors.dividerSoft,
            }}
          >
            <Text numberOfLines={1} style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.text }}>
              {s.title}
            </Text>
            {s.weeks > 0 ? (
              <Text style={{ fontSize: 11, color: colors.textMuted }}>
                {s.weeks} sem · pico #{s.peak}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
