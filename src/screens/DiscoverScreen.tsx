import React from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { Screen } from "../components/Screen";
import { SectionHeader } from "../components/SectionHeader";
import { Cover } from "../components/Cover";
import { SongRow } from "../components/SongRow";
import { PEOPLE } from "../data/mock";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useRecommendationsQuery } from "../api/discover";
import { useGlobalSongsQuery, songItemToGlobalSong } from "../api/global";
import { useHomeDiscoveryQuery } from "../api/homeHub";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DiscoverScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { cards: trending, isLoading: isTrendingLoading } = useRecommendationsQuery();
  const songsQuery = useGlobalSongsQuery("weekly");
  const discoveryQuery = useHomeDiscoveryQuery();
  const popularCharts = discoveryQuery.data?.charts ?? [];
  const climbing = (songsQuery.data?.items ?? [])
    .filter((s) => s.movement === "up")
    .slice(0, 4)
    .map((s, i) => songItemToGlobalSong(s, i));

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 30, fontWeight: "800", letterSpacing: -0.8, color: colors.text }}>Discover</Text>
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Pressable
          onPress={() => navigation.navigate("Search")}
          style={{ flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.fillSubtle, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 13 }}
        >
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round">
            <Circle cx={11} cy={11} r={7} />
            <Path d="M20 20l-3.5-3.5" />
          </Svg>
          <Text style={{ fontSize: 14.5, color: colors.textMuted }}>Músicas, artistas, paradas, pessoas</Text>
        </Pressable>
      </View>

      <SectionHeader title="Em alta esta semana" />
      {isTrendingLoading ? (
        <ActivityIndicator color={colors.textMuted} style={{ marginVertical: 12 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
          {trending.map((c) => (
            <Pressable key={c.key} onPress={() => navigation.navigate("MusicDetail", { songId: c.songId })} style={{ width: 150 }}>
              <Cover cover={c.cover} size={150} rounded={14} />
              <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text, marginTop: 8 }}>
                {c.t}
              </Text>
              <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted }}>
                {c.a}
              </Text>
            </Pressable>
          ))}
          {trending.length === 0 && (
            <Text style={{ fontSize: 13, color: colors.textMuted, paddingVertical: 8 }}>Nada em alta no momento.</Text>
          )}
        </ScrollView>
      )}

      <SectionHeader title="Paradas populares" />
      {discoveryQuery.isLoading ? (
        <ActivityIndicator color={colors.textMuted} style={{ marginVertical: 12 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
          {popularCharts.map((pc) => (
            <Pressable
              key={pc.id}
              onPress={() => navigation.navigate("UserDetail", { handle: pc.authorHandle })}
              style={{ width: 230, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 14 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
                {pc.authorImage ? (
                  <View style={{ width: 30, height: 30, borderRadius: 15, overflow: "hidden" }}>
                    <Cover cover={{ palette: ["#1D1D1F", "#5B5B60"], seed: 0, imageUrl: pc.authorImage }} size={30} rounded={15} />
                  </View>
                ) : (
                  <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: pc.authorColor, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>{pc.authorName.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                    {pc.paradaNome}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 11, color: colors.textMuted }}>
                    @{pc.authorHandle} · {pc.likes} curtidas
                  </Text>
                </View>
              </View>
              <View style={{ marginTop: 11, gap: 7 }}>
                {pc.topSongs.map((s, i) => (
                  <View key={`${i}-${s.title}`} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ width: 12, fontSize: 11.5, fontWeight: "800", color: colors.textMuted }}>{i + 1}</Text>
                    <Cover cover={{ palette: ["#1D1D1F", "#5B5B60"], seed: i, imageUrl: s.coverUrl ?? undefined }} size={26} rounded={6} />
                    <Text numberOfLines={1} style={{ flex: 1, fontSize: 12.5, fontWeight: "600", color: colors.text }}>
                      {s.title}
                    </Text>
                  </View>
                ))}
              </View>
            </Pressable>
          ))}
          {popularCharts.length === 0 && (
            <Text style={{ fontSize: 13, color: colors.textMuted, paddingVertical: 8 }}>Nenhuma parada popular no momento.</Text>
          )}
        </ScrollView>
      )}

      <SectionHeader title="Subindo rápido" />
      <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden", marginHorizontal: 16 }}>
        {climbing.map((s, i) => (
          <SongRow
            key={s.t}
            song={s}
            last={i === climbing.length - 1}
            onPress={s.songId ? () => navigation.navigate("MusicDetail", { songId: s.songId!, spotifyId: s.spotifyId ?? undefined }) : undefined}
          />
        ))}
      </View>

      <SectionHeader title="Pessoas com gosto parecido" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
        {PEOPLE.map((u) => (
          <View
            key={u.handle}
            style={{ width: 132, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 16, alignItems: "center" }}
          >
            <Pressable onPress={() => navigation.navigate("UserDetail")}>
              <LinearGradient colors={u.avatar} style={{ width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>{u.initial}</Text>
              </LinearGradient>
            </Pressable>
            <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 10 }}>
              {u.handle}
            </Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{u.match}</Text>
            <Pressable style={{ marginTop: 11, backgroundColor: colors.accent, borderRadius: 100, paddingVertical: 9, width: "100%", alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>Seguir</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
