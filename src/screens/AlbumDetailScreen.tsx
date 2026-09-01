import React from "react";
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Linking } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { ScoreSquare } from "../components/ScoreSquare";
import { resolveMediaUrl } from "../lib/api";
import { useAlbumQuery, useAlbumReviewsQuery, useToggleReviewHelpfulMutation } from "../api/album";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "AlbumDetail">;

export function AlbumDetailScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const albumId = route.params?.albumId;
  const albumQuery = useAlbumQuery(albumId);
  const reviewsQuery = useAlbumReviewsQuery(albumId);
  const helpfulMutation = useToggleReviewHelpfulMutation(albumId);
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
      <BackHeader
        action={
          <Pressable
            onPress={() =>
              navigation.navigate("WriteReview", {
                albumId: album.albumId,
                title: album.title,
                artist: album.artist,
                coverUrl: album.coverUrl,
              })
            }
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, backgroundColor: colors.accentTint }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.accent }}>Avaliar</Text>
          </Pressable>
        }
      />

      <View style={{ alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18 }}>
        {album.coverUrl ? (
          <Image source={{ uri: resolveMediaUrl(album.coverUrl) }} style={{ width: 176, height: 176, borderRadius: 20 }} />
        ) : (
          <View style={{ width: 176, height: 176, borderRadius: 20, backgroundColor: colors.fillSubtle }} />
        )}
        <Text style={{ fontSize: 23, fontWeight: "800", letterSpacing: -0.5, color: colors.text, marginTop: 18, textAlign: "center" }}>
          {album.title}
        </Text>
        <Pressable onPress={() => navigation.navigate("ArtistDetail", { artistId: album.artistId })}>
          <Text style={{ fontSize: 15, color: colors.textMuted, marginTop: 4 }}>
            {album.artist}
            {album.releaseYear ? ` · ${album.releaseYear}` : ""}
          </Text>
        </Pressable>
        <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 6 }}>
          {album.totalTracks} {album.totalTracks === 1 ? "faixa" : "faixas"}
          {album.label ? ` · ${album.label}` : ""}
        </Text>
        {album.genres.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 10 }}>
            {album.genres.map((g) => (
              <View key={g} style={{ backgroundColor: colors.fillSubtle, borderRadius: 100, paddingVertical: 5, paddingHorizontal: 11 }}>
                <Text style={{ fontSize: 11.5, fontWeight: "600", color: colors.text }}>{g}</Text>
              </View>
            ))}
          </View>
        )}
        {album.spotifyUrl && (
          <Pressable onPress={() => Linking.openURL(album.spotifyUrl!)} style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "700" }}>Ouvir no Spotify</Text>
          </Pressable>
        )}
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

      {album.stats.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 16,
            marginTop: 12,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.divider,
            borderRadius: 16,
            padding: 16,
          }}
        >
          {album.stats.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={{ width: 1, backgroundColor: colors.dividerSoft }} />}
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "800", letterSpacing: -0.5, color: s.color === "var(--accent)" ? colors.accent : s.color }}>
                  {s.value}
                </Text>
                <Text style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 2, textAlign: "center" }}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      )}

      {album.topFans.length > 0 && (
        <View style={{ marginTop: 26 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.4, color: colors.text, paddingHorizontal: 20, paddingBottom: 12 }}>
            Maiores fãs
          </Text>
          <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
            {album.topFans.map((f, i) => (
              <Pressable
                key={f.user.id}
                onPress={() => navigation.navigate("UserDetail", { handle: f.user.handle })}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderBottomWidth: i === album.topFans.length - 1 ? 0 : 1,
                  borderBottomColor: colors.dividerSoft,
                }}
              >
                {f.user.image ? (
                  <Image source={{ uri: resolveMediaUrl(f.user.image) }} style={{ width: 30, height: 30, borderRadius: 15 }} />
                ) : (
                  <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.fillSubtle }} />
                )}
                <Text style={{ flex: 1, fontSize: 13.5, fontWeight: "600", color: colors.text }}>{f.user.name}</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: "700" }}>{f.points} pts</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

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

      <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.4, color: colors.text, paddingHorizontal: 20, paddingTop: 26, paddingBottom: 12 }}>
        Reviews
      </Text>
      {(reviewsQuery.data?.length ?? 0) === 0 ? (
        <Text style={{ paddingHorizontal: 20, fontSize: 13, color: colors.textMuted }}>Nenhuma review ainda.</Text>
      ) : (
        <View style={{ marginHorizontal: 16, gap: 10 }}>
          {reviewsQuery.data!.map((r) => (
            <View key={r.id} style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 14 }}>
              <Pressable
                onPress={() => navigation.navigate("UserDetail", { handle: r.user.handle })}
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                {r.user.image ? (
                  <Image source={{ uri: resolveMediaUrl(r.user.image) }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                ) : (
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: r.user.avatarColor || colors.fillSubtle, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>{r.user.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <Text style={{ flex: 1, fontSize: 13.5, fontWeight: "700", color: colors.text }}>{r.user.name}</Text>
                <ScoreSquare score={r.rating} size={28} />
              </Pressable>
              {r.body ? (
                <Text style={{ fontSize: 13.5, lineHeight: 20, color: colors.textSubtle, marginTop: 10 }}>{r.body}</Text>
              ) : null}
              <Pressable
                onPress={() => helpfulMutation.mutate(r.id)}
                disabled={helpfulMutation.isPending}
                style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 }}
              >
                <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: "600" }}>
                  👍 {r.helpful} {r.helpful === 1 ? "achou útil" : "acharam útil"}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
