import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView, Image, LayoutChangeEvent } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useAppTheme } from "../theme/ThemeProvider";
import { resolveMediaUrl } from "../lib/api";
import {
  BUBBLE_TAB_LABELS,
  BUBBLE_TABS,
  BubbleCenter,
  BubbleMatch,
  BubbleRecommendation,
  BubbleTab,
  recommendationTarget,
  reasonText,
  useBubbleQuery,
} from "../api/bubble";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ORBIT_SIZE = 8;
const MIN_RADIUS = 0.28;
const MAX_RADIUS = 0.4;

function AvatarCircle({
  image,
  name,
  color,
  size,
}: {
  image: string | null;
  name: string;
  color: string;
  size: number;
}) {
  if (image) {
    return (
      <Image
        source={{ uri: resolveMediaUrl(image) }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <LinearGradient
      colors={[color || "#8BC34A", "#CDDC39"]}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center" }}
    >
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.38 }}>{(name || "?").charAt(0).toUpperCase()}</Text>
    </LinearGradient>
  );
}

function Orbit({
  center,
  matches,
  activeId,
  onSelect,
}: {
  center: BubbleCenter;
  matches: BubbleMatch[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const { colors } = useAppTheme();
  const [box, setBox] = useState(0);
  const orbit = matches.slice(0, ORBIT_SIZE);

  const onLayout = (e: LayoutChangeEvent) => {
    setBox(e.nativeEvent.layout.width);
  };

  const nodes = useMemo(() => {
    if (box <= 0 || orbit.length === 0) return [];
    return orbit.map((match, index) => {
      const angle = (index / orbit.length) * 2 * Math.PI - Math.PI / 2;
      const clamped = Math.min(Math.max(match.score, 0), 100);
      const radiusPct = MAX_RADIUS - (clamped / 100) * (MAX_RADIUS - MIN_RADIUS);
      const radius = box * radiusPct;
      const size = 36 + (match.score / 100) * 16;
      const x = box / 2 + radius * Math.cos(angle) - size / 2;
      const y = box / 2 + radius * Math.sin(angle) - size / 2;
      return { match, size, x, y };
    });
  }, [box, orbit]);

  if (orbit.length === 0) return null;

  const centerSize = 64;

  return (
    <View onLayout={onLayout} style={{ height: box > 0 ? box : 280, marginHorizontal: 8, marginBottom: 8 }}>
      {box > 0 && (
        <View
          style={{
            position: "absolute",
            left: box / 2 - centerSize / 2,
            top: box / 2 - centerSize / 2,
            alignItems: "center",
            width: centerSize,
          }}
        >
          <AvatarCircle image={center.image} name={center.name} color={center.avatarColor} size={centerSize} />
        </View>
      )}
      {nodes.map(({ match, size, x, y }) => {
        const active = match.matchedUserId === activeId;
        return (
          <Pressable
            key={match.matchedUserId}
            onPress={() => onSelect(match.matchedUserId)}
            style={{
              position: "absolute",
              left: x,
              top: y,
              borderRadius: size / 2,
              borderWidth: active ? 2 : 0,
              borderColor: colors.accent,
            }}
          >
            <AvatarCircle image={match.image} name={match.name} color={match.avatarColor} size={size} />
            <View
              style={{
                position: "absolute",
                right: -4,
                bottom: -4,
                backgroundColor: colors.accent,
                borderRadius: 8,
                paddingHorizontal: 4,
                minWidth: 22,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>{match.score}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function MatchDetail({ match, navigation }: { match: BubbleMatch; navigation: Nav }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 16,
        padding: 14,
      }}
    >
      <Pressable
        onPress={() => navigation.navigate("UserDetail", { handle: match.handle })}
        style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 }}
      >
        <AvatarCircle image={match.image} name={match.name} color={match.avatarColor} size={44} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
            {match.name}
          </Text>
          <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>Afinidade {match.score}</Text>
        </View>
      </Pressable>
      <Text style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 18 }}>
        Artistas: {match.artistScore}% · Músicas: {match.trackScore}% · Álbuns: {match.albumScore}%
      </Text>
      <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 4, lineHeight: 18 }}>
        {match.sharedArtists} artistas em comum · {match.sharedTracks} músicas em comum · {match.sharedAlbums} álbuns em
        comum
      </Text>
      {match.reasons.length > 0 ? (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 6 }}>
            Por que vocês estão na mesma bolha
          </Text>
          {match.reasons.map((reason, i) => (
            <Text key={i} style={{ fontSize: 13, color: colors.textSubtle, lineHeight: 19, marginBottom: 2 }}>
              {reasonText(reason)}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function openRecommendation(rec: BubbleRecommendation, navigation: Nav) {
  const target = recommendationTarget(rec);
  if (!target) return;
  if (target.kind === "song") navigation.navigate("MusicDetail", { songId: target.songId });
  else if (target.kind === "artist") navigation.navigate("ArtistDetail", { artistId: target.artistId });
  else navigation.navigate("AlbumDetail", { albumId: target.albumId });
}

function RecommendationList({
  title,
  hint,
  empty,
  items,
  navigation,
}: {
  title: string;
  hint: string;
  empty: string;
  items: BubbleRecommendation[];
  navigation: Nav;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text }}>{title}</Text>
      <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 12, lineHeight: 19 }}>{hint}</Text>
      {items.length === 0 ? (
        <Text style={{ fontSize: 13.5, color: colors.textMuted }}>{empty}</Text>
      ) : (
        items.map((rec) => {
          const target = recommendationTarget(rec);
          return (
            <Pressable
              key={rec.entityKey}
              onPress={target ? () => openRecommendation(rec, navigation) : undefined}
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.dividerSoft,
              }}
            >
              <Text numberOfLines={1} style={{ fontSize: 14.5, fontWeight: "700", color: colors.text }}>
                {rec.name}
              </Text>
              {rec.artist ? (
                <Text numberOfLines={1} style={{ fontSize: 13, color: colors.textSubtle, marginTop: 2 }}>
                  {rec.artist}
                </Text>
              ) : null}
              <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 3 }}>
                {rec.usersCount} {rec.usersCount === 1 ? "pessoa da sua bolha" : "pessoas da sua bolha"}
                {rec.avgPosition != null ? ` · posição média #${rec.avgPosition}` : ""}
              </Text>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

export function BubbleScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const query = useBubbleQuery();
  const [tab, setTab] = useState<BubbleTab>("bolha");
  const [activeId, setActiveId] = useState<string | null>(null);

  const center = query.data?.center;
  const data = query.data?.data ?? null;
  const active = data?.matches.find((m) => m.matchedUserId === activeId) ?? data?.matches[0] ?? null;

  return (
    <Screen scroll={false}>
      <BackHeader title="Minha Bolha" />
      {query.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : !query.data ? (
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>
          Não foi possível carregar a sua bolha.
        </Text>
      ) : (
        <>
          <Text style={{ fontSize: 13.5, lineHeight: 20, color: colors.textMuted, paddingHorizontal: 16, paddingBottom: 12 }}>
            As pessoas com o gosto mais parecido com o seu, calculado toda semana a partir do que você e elas colocam nas
            próprias paradas.
          </Text>

          {!data ? (
            <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 18 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
                Sua bolha ainda não foi calculada
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textMuted }}>
                Isso acontece toda semana, a partir da sua parada principal publicada. Assim que houver dado suficiente,
                as pessoas mais parecidas com você aparecem aqui.
              </Text>
            </View>
          ) : (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
              >
                {BUBBLE_TABS.map((key) => (
                  <Pressable
                    key={key}
                    onPress={() => setTab(key)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 100,
                      backgroundColor: tab === key ? colors.accent : colors.fillSubtle,
                    }}
                  >
                    <Text style={{ color: tab === key ? "#fff" : colors.text, fontWeight: "700", fontSize: 12.5 }}>
                      {BUBBLE_TAB_LABELS[key]}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
                {tab === "bolha" && center && (
                  <>
                    <Orbit
                      center={center}
                      matches={data.matches}
                      activeId={active?.matchedUserId ?? null}
                      onSelect={setActiveId}
                    />
                    {active ? <MatchDetail match={active} navigation={navigation} /> : null}
                    {data.matches.length > 0 ? (
                      <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
                        <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
                          Todos os matches
                        </Text>
                        {data.matches.map((match) => (
                          <Pressable
                            key={match.matchedUserId}
                            onPress={() => navigation.navigate("UserDetail", { handle: match.handle })}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 12,
                              paddingVertical: 12,
                              borderBottomWidth: 1,
                              borderBottomColor: colors.dividerSoft,
                            }}
                          >
                            <AvatarCircle image={match.image} name={match.name} color={match.avatarColor} size={40} />
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                                {match.name}
                              </Text>
                              <Text numberOfLines={1} style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>
                                {match.sharedArtists} artistas em comum · {match.sharedTracks} músicas em comum
                              </Text>
                            </View>
                            <Text style={{ fontSize: 15, fontWeight: "800", color: colors.accent }}>{match.score}</Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </>
                )}

                {tab === "musicas" && (
                  <RecommendationList
                    title="Músicas"
                    hint="Músicas que a sua bolha ouve e você ainda não colocou em nenhuma parada."
                    empty="Ainda não há música da sua bolha que você não tenha chartado."
                    items={data.recommendations.tracks}
                    navigation={navigation}
                  />
                )}

                {tab === "albuns" && (
                  <RecommendationList
                    title="Álbuns"
                    hint="Álbuns que a sua bolha ouve e você ainda não colocou em nenhuma parada."
                    empty="Ainda não há álbum da sua bolha que você não tenha chartado."
                    items={data.recommendations.albums}
                    navigation={navigation}
                  />
                )}

                {tab === "artistas" && (
                  <>
                    <RecommendationList
                      title="Nunca apareceu"
                      hint="Artistas que a sua bolha ouve e você nunca colocou em nenhuma parada."
                      empty="Ainda não há artista assim na sua bolha."
                      items={data.recommendations.artists.never}
                      navigation={navigation}
                    />
                    <RecommendationList
                      title="Pouco explorado"
                      hint="Artistas que você já colocou em alguma parada, mas pouco, e sua bolha ouve bastante."
                      empty="Ainda não há artista assim na sua bolha."
                      items={data.recommendations.artists.little}
                      navigation={navigation}
                    />
                    <RecommendationList
                      title="Em alta na sua bolha"
                      hint="Artistas que você já ouve e pesam bastante entre as pessoas mais parecidas com você."
                      empty="Ainda não há artista assim na sua bolha."
                      items={data.recommendations.artists.trending}
                      navigation={navigation}
                    />
                  </>
                )}

                <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 8 }}>
                  Calculado em {new Date(data.calculatedAt).toLocaleDateString("pt-BR")}
                </Text>
              </ScrollView>
            </>
          )}
        </>
      )}
    </Screen>
  );
}
