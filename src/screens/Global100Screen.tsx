import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { SongRow } from "../components/SongRow";
import { useGlobalArtistsQuery, useGlobalSongsQuery, songItemToGlobalSong } from "../api/global";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS = [
  { id: "songs", label: "Músicas" },
  { id: "artists", label: "Artistas" },
  { id: "albums", label: "Álbuns" },
  { id: "clips", label: "Clipes" },
] as const;

function ComingSoon({ label }: { label: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ marginHorizontal: 16, paddingVertical: 40, alignItems: "center" }}>
      <Text style={{ color: colors.textMuted, fontSize: 13.5, textAlign: "center" }}>
        Ranking de {label} ainda não está disponível.
      </Text>
    </View>
  );
}

export function Global100Screen({ asTab }: { asTab?: boolean } = {}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("songs");
  const [week, setWeek] = useState<number | undefined>(undefined);

  const songsQuery = useGlobalSongsQuery("weekly", week);
  const artistsQuery = useGlobalArtistsQuery("weekly", week);

  const active = tab === "artists" ? artistsQuery : songsQuery;
  const header = active.data;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Como aba (mirror do /global do site), a raiz da tab não tem para onde
          voltar — goBack() aqui vazaria para fora da Main e sairia do tab flow. */}
      {asTab ? <View style={{ height: insets.top + 8 }} /> : <BackHeader />}

      <View style={{ marginHorizontal: 16, backgroundColor: "#1D1D1F", borderRadius: 18, padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8}>
              <Circle cx={12} cy={12} r={10} />
              <Line x1={2} y1={12} x2={22} y2={12} />
              <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </Svg>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 11, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
              {header?.weekLabel ?? "Carregando…"}
            </Text>
            <Text style={{ fontSize: 32, fontWeight: "800", letterSpacing: -0.7, color: "#fff", marginTop: 4 }}>Global 100</Text>
          </View>
        </View>
        {header ? (
          <View style={{ flexDirection: "row", gap: 16, marginTop: 16 }}>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{header.dateRange}</Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>·</Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{header.items.length} {tab === "artists" ? "artistas" : "músicas"}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
          <Pressable
            disabled={!header?.hasPrevWeek}
            onPress={() => header?.prevWeekIndex && setWeek(header.prevWeekIndex)}
            style={{ borderWidth: 1, borderColor: header?.hasPrevWeek ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)", paddingVertical: 8, paddingHorizontal: 13, borderRadius: 10 }}
          >
            <Text style={{ color: header?.hasPrevWeek ? "#fff" : "rgba(255,255,255,0.45)", fontWeight: "600", fontSize: 12.5 }}>‹ Anterior</Text>
          </Pressable>
          <Pressable
            disabled={!header?.hasNextWeek}
            onPress={() => header?.nextWeekIndex && setWeek(header.nextWeekIndex)}
            style={{ borderWidth: 1, borderColor: header?.hasNextWeek ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)", paddingVertical: 8, paddingHorizontal: 13, borderRadius: 10 }}
          >
            <Text style={{ color: header?.hasNextWeek ? "#fff" : "rgba(255,255,255,0.45)", fontWeight: "600", fontSize: 12.5 }}>Próxima ›</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 16 }}>
        {TABS.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTab(t.id)}
            style={{ backgroundColor: tab === t.id ? colors.btnDarkBg : colors.fillSubtle, borderRadius: 100, paddingVertical: 10, paddingHorizontal: 15, marginRight: 8 }}
          >
            <Text style={{ color: tab === t.id ? colors.btnDarkFg : colors.textSubtle, fontWeight: "700", fontSize: 13 }}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {tab === "clips" ? (
        <ComingSoon label="clipes" />
      ) : tab === "albums" ? (
        <ComingSoon label="álbuns" />
      ) : active.isLoading ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <ActivityIndicator color={colors.text} />
        </View>
      ) : active.isError ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <Text style={{ color: colors.textMuted, fontSize: 13.5 }}>Não foi possível carregar o ranking.</Text>
        </View>
      ) : (
        <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
          {tab === "artists"
            ? artistsQuery.data?.items.map((a, i) => (
                <SongRow
                  key={`${a.position}-${a.name}`}
                  song={{ t: a.name, a: "", mv: a.movement, d: a.delta ?? undefined, cover: { palette: ["#1D1D1F", "#5B5B60"], seed: i } }}
                  position={a.position}
                  meta={`${a.weeks} ${a.weeks === 1 ? "semana" : "semanas"} · pico #${a.peak}`}
                  last={i === (artistsQuery.data?.items.length ?? 0) - 1}
                />
              ))
            : songsQuery.data?.items.map((s, i) => {
                const song = songItemToGlobalSong(s, i);
                return (
                  <SongRow
                    key={`${s.position}-${s.title}`}
                    song={song}
                    position={s.position}
                    meta={song.meta}
                    last={i === (songsQuery.data?.items.length ?? 0) - 1}
                    onPress={song.songId ? () => navigation.navigate("MusicDetail", { songId: song.songId!, spotifyId: song.spotifyId ?? undefined }) : undefined}
                  />
                );
              })}
        </View>
      )}
    </ScrollView>
  );
}
