import React from "react";
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { resolveMediaUrl } from "../lib/api";
import { useArtistQuery } from "../api/artist";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "ArtistDetail">;

export function ArtistDetailScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const artistId = route.params?.artistId;
  const artistQuery = useArtistQuery(artistId);
  const artist = artistQuery.data;

  if (artistId == null) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader />
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>Artista não encontrado.</Text>
      </SafeAreaView>
    );
  }

  if (artistQuery.isLoading) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader />
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!artist) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader />
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>
          Não foi possível carregar esse artista.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <BackHeader />

      <View style={{ alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18 }}>
        {artist.imageUrl ? (
          <Image source={{ uri: resolveMediaUrl(artist.imageUrl) }} style={{ width: 140, height: 140, borderRadius: 70 }} />
        ) : (
          <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: colors.fillSubtle }} />
        )}
        <Text style={{ fontSize: 23, fontWeight: "800", letterSpacing: -0.5, color: colors.text, marginTop: 18, textAlign: "center" }}>
          {artist.name}
        </Text>
        {artist.monthlyListeners ? (
          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
            {artist.monthlyListeners.toLocaleString("pt-BR")} ouvintes mensais
          </Text>
        ) : null}
        {artist.genres.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 12 }}>
            {artist.genres.map((g) => (
              <View key={g} style={{ backgroundColor: colors.fillSubtle, borderRadius: 100, paddingVertical: 6, paddingHorizontal: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>{g}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {artist.resumo ? (
        <View style={{ marginHorizontal: 16, marginBottom: 26 }}>
          <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textSubtle }}>
            {artist.resumo}
          </Text>
        </View>
      ) : null}

      {(artist.totalPoints > 0 || artist.number1s > 0 || artist.listenersCount > 0) && (
        <View style={{ marginBottom: 26 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", letterSpacing: 0.4, textTransform: "uppercase", color: colors.textMuted, paddingHorizontal: 20, paddingBottom: 8 }}>
            No Global 100
          </Text>
          <View
            style={{
              flexDirection: "row",
              marginHorizontal: 16,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.divider,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{artist.totalPoints}</Text>
              <Text style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 2 }}>pontos totais</Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.dividerSoft }} />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{artist.listenersCount}</Text>
              <Text style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 2 }}>ouvintes únicos</Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.dividerSoft }} />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{artist.number1s}</Text>
              <Text style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 2 }}>músicas em #1</Text>
            </View>
          </View>
        </View>
      )}

      {artist.myStats && (
        <View style={{ marginBottom: 26 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", letterSpacing: 0.4, textTransform: "uppercase", color: colors.textMuted, paddingHorizontal: 20, paddingBottom: 8 }}>
            Na sua parada
          </Text>
          <View
            style={{
              flexDirection: "row",
              marginHorizontal: 16,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.divider,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{artist.myStats.appearances}</Text>
              <Text style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 2 }}>aparições</Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.dividerSoft }} />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{artist.myStats.totalPoints}</Text>
              <Text style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 2 }}>seus pontos</Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.dividerSoft }} />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{artist.myStats.number1s}</Text>
              <Text style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 2 }}>seus #1</Text>
            </View>
          </View>
        </View>
      )}

      {artist.bigFans.length > 0 && (
        <View style={{ marginBottom: 26 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.4, color: colors.text, paddingHorizontal: 20, paddingBottom: 12 }}>
            Maiores fãs
          </Text>
          <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
            {artist.bigFans.map((f, i) => (
              <Pressable
                key={f.user.id}
                onPress={() => navigation.navigate("UserDetail", { handle: f.user.handle })}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderBottomWidth: i === artist.bigFans.length - 1 ? 0 : 1,
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

      {artist.topSongs.length > 0 ? (
        <>
          <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.4, color: colors.text, paddingHorizontal: 20, paddingBottom: 12 }}>
            Faixas no Global 100
          </Text>
          <View style={{ marginHorizontal: 16, marginBottom: 26, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
            {artist.topSongs.map((s, i) => (
              <Pressable
                key={s.songId}
                onPress={() => navigation.navigate("MusicDetail", { songId: s.songId, spotifyId: s.spotifyId ?? undefined })}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderBottomWidth: i === artist.topSongs.length - 1 ? 0 : 1,
                  borderBottomColor: colors.dividerSoft,
                }}
              >
                {s.coverUrl ? (
                  <Image source={{ uri: resolveMediaUrl(s.coverUrl) }} style={{ width: 40, height: 40, borderRadius: 8 }} />
                ) : (
                  <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colors.fillSubtle }} />
                )}
                <Text numberOfLines={1} style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.text }}>
                  {s.title}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  {s.weeks} sem · pico #{s.peak}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {artist.albums.length > 0 ? (
        <>
          <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.4, color: colors.text, paddingHorizontal: 20, paddingBottom: 12 }}>
            Discografia
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
            {artist.albums.map((a) => (
              <Pressable key={a.albumId} onPress={() => navigation.navigate("AlbumDetail", { albumId: a.albumId })} style={{ width: 120 }}>
                {a.coverUrl ? (
                  <Image source={{ uri: resolveMediaUrl(a.coverUrl) }} style={{ width: 120, height: 120, borderRadius: 12 }} />
                ) : (
                  <View style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: colors.fillSubtle }} />
                )}
                <Text numberOfLines={1} style={{ fontSize: 12.5, fontWeight: "600", color: colors.text, marginTop: 8 }}>
                  {a.title}
                </Text>
                {a.releaseYear ? (
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>{a.releaseYear}</Text>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}
    </ScrollView>
    </SafeAreaView>
  );
}
