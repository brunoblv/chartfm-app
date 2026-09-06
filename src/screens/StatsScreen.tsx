import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useAppTheme } from "../theme/ThemeProvider";
import { useProfileStatsQuery, ProfileStatsData, weekNumberFromIndex } from "../api/stats";
import { RootStackParamList } from "../navigation/RootNavigator";

type Route = RouteProp<RootStackParamList, "Stats">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const GENRE_COLORS = ["#FA243C", "#7C5CFF", "#20C4B0", "#FFB020", "#3E8BFF"];

function formatCount(n: number): string {
  return n.toLocaleString("pt-BR");
}

function artistIdFromHref(href: string): number | undefined {
  const match = href.match(/\/artist\/(\d+)/);
  return match ? Number(match[1]) : undefined;
}

function Bar({ pct, color }: { pct: number; color: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ height: 6, borderRadius: 100, backgroundColor: colors.fillSubtle, overflow: "hidden" }}>
      <View style={{ width: `${Math.max(pct, 2)}%`, height: "100%", borderRadius: 100, backgroundColor: color }} />
    </View>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 18,
        padding: 18,
        marginHorizontal: 16,
        marginTop: 14,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, letterSpacing: -0.3 }}>{title}</Text>
      <Text style={{ fontSize: 12.5, lineHeight: 19, color: colors.textMuted, marginTop: 6, marginBottom: 14 }}>
        {description}
      </Text>
      {children}
    </View>
  );
}

function StatsBody({ stats, navigation }: { stats: ProfileStatsData; navigation: Nav }) {
  const { colors } = useAppTheme();
  const tiles = [
    { value: stats.distinctSongs, label: "músicas diferentes" },
    { value: stats.distinctArtists, label: "artistas diferentes" },
    { value: stats.publishedCharts, label: "paradas publicadas" },
    { value: stats.totalSlots, label: "posições publicadas" },
  ];

  return (
    <>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16, marginTop: 4 }}>
        {tiles.map((tile) => (
          <View
            key={tile.label}
            style={{
              width: "47%",
              flexGrow: 1,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.divider,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 26, fontWeight: "800", letterSpacing: -0.6, color: colors.text }}>
              {formatCount(tile.value)}
            </Text>
            <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 4 }}>{tile.label}</Text>
          </View>
        ))}
      </View>

      {stats.topArtists.length > 0 && (
        <Section
          title="Artistas mais presentes"
          description="Quantas posições cada artista já ocupou, somando todas as paradas publicadas. A barra compara com o primeiro da lista."
        >
          {stats.topArtists.map((artist, i) => {
            const artistId = artistIdFromHref(artist.href);
            return (
              <View key={artist.key} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: i === stats.topArtists.length - 1 ? 0 : 14 }}>
                <Text style={{ width: 18, fontSize: 13, fontWeight: "800", color: colors.textMuted }}>{i + 1}</Text>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Pressable disabled={artistId == null} onPress={() => artistId != null && navigation.navigate("ArtistDetail", { artistId })}>
                    <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text, marginBottom: 6 }}>
                      {artist.name}
                    </Text>
                  </Pressable>
                  <Bar pct={artist.pct} color={colors.accent} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: "700", color: colors.textMuted, minWidth: 36, textAlign: "right" }}>
                  {formatCount(artist.appearances)}
                </Text>
              </View>
            );
          })}
        </Section>
      )}

      {stats.genres.length > 0 && (
        <Section
          title="Gêneros"
          description={`Entram ${formatCount(stats.songsWithGenre)} das ${formatCount(stats.distinctSongs)} músicas, que são as que têm alguma tag de gênero. Uma música com mais de uma tag conta em cada uma.`}
        >
          {stats.genres.map((genre, i) => (
            <View key={genre.key} style={{ marginBottom: i === stats.genres.length - 1 ? 0 : 13 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                <Text numberOfLines={1} style={{ flex: 1, fontSize: 13, fontWeight: "600", color: colors.text }}>
                  {genre.name}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: colors.textMuted }}>{genre.pct}%</Text>
              </View>
              <Bar pct={genre.pct} color={GENRE_COLORS[i % GENRE_COLORS.length]} />
            </View>
          ))}
        </Section>
      )}

      {stats.diversity != null && stats.topArtistShare != null && (
        <Section title="Concentração" description="O quanto as paradas se espalham entre artistas diferentes, em vez de repetir os mesmos.">
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
            <Text style={{ fontSize: 40, fontWeight: "800", letterSpacing: -1, color: colors.text }}>{stats.diversity}</Text>
            <Text style={{ fontSize: 13, color: colors.textMuted }}>de 100</Text>
          </View>
          <Bar pct={stats.diversity} color={colors.accent} />
          <Text style={{ fontSize: 12.5, lineHeight: 19, color: colors.textMuted, marginTop: 12 }}>
            Os cinco artistas mais presentes ocupam {stats.topArtistShare}% das {formatCount(stats.totalSlots)} posições já
            publicadas. O número acima é o que sobra para todo o resto.
          </Text>
        </Section>
      )}

      {stats.decades.length > 0 && (
        <Section
          title="De que época são as músicas"
          description={`Por década de lançamento. Entram ${formatCount(stats.songsWithDate)} das ${formatCount(stats.distinctSongs)} músicas, que são as que têm data de lançamento cadastrada.`}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, height: 140 }}>
            {stats.decades.map((decade) => (
              <View key={decade.key} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted }}>{formatCount(decade.songs)}</Text>
                <View
                  style={{
                    width: "100%",
                    height: `${Math.max(decade.pct, 3)}%`,
                    minHeight: 4,
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                    backgroundColor: colors.accent,
                    opacity: 0.85,
                  }}
                />
                <Text style={{ fontSize: 11.5, fontWeight: "700", color: colors.textSubtle }}>{decade.label}</Text>
              </View>
            ))}
          </View>
        </Section>
      )}

      {stats.timeline.length > 0 && (
        <Section
          title="Atividade por semana"
          description={`Quantas posições foram publicadas em cada uma das últimas ${stats.timeline.length} semanas. Só paradas semanais entram.`}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 90 }}>
            {stats.timeline.map((week) => (
              <View
                key={week.weekIndex}
                accessibilityLabel={`Semana ${weekNumberFromIndex(week.weekIndex)}: ${week.entries} posições`}
                style={{
                  flex: 1,
                  height: `${Math.max(week.pct, 4)}%`,
                  minHeight: 3,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                  backgroundColor: colors.accent,
                  opacity: 0.8,
                }}
              />
            ))}
          </View>
        </Section>
      )}
    </>
  );
}

export function StatsScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const handle = route.params?.handle;
  const query = useProfileStatsQuery(handle);
  const data = query.data;

  if (!handle) {
    return (
      <Screen>
        <BackHeader title="Estatísticas" />
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>Perfil não encontrado.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackHeader title="Estatísticas" />
      {query.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : !data ? (
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>
          Não foi possível carregar as estatísticas.
        </Text>
      ) : data.stats.publishedCharts === 0 ? (
        <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textMuted, marginHorizontal: 20, marginTop: 12 }}>
          Esse perfil ainda não publicou nenhuma parada, então não há o que contar aqui. Os números aparecem depois da
          primeira publicação.
        </Text>
      ) : (
        <>
          <Text style={{ fontSize: 13.5, lineHeight: 20, color: colors.textMuted, marginHorizontal: 16, marginBottom: 8 }}>
            O que as paradas publicadas por {data.name} mostram: quem mais aparece, de que gêneros e de que época são as
            músicas, e como foi a atividade das últimas semanas.
          </Text>
          <StatsBody stats={data.stats} navigation={navigation} />
        </>
      )}
    </Screen>
  );
}
