import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { Screen } from "../components/Screen";
import { ScoreSquare } from "../components/ScoreSquare";
import { resolveMediaUrl } from "../lib/api";
import { RootStackParamList } from "../navigation/RootNavigator";
import {
  CriticsFMAlbum,
  SpotifyAlbumHit,
  WeeklyReleaseAlbum,
  useAddSpotifyAlbumMutation,
  useCriticsFMQuery,
  useSpotifyAlbumSearch,
} from "../api/criticsfm";
import { useClubeQuery, CLUBE_PHASE_LABELS, type ClubePhase } from "../api/clube";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PAGE_SIZE = 16;

type SortId = "recent" | "score" | "reviews";
type ScoreFilter = "all" | "acclaimed" | "recommended" | "mixed" | "unfavorable" | "rejected" | "unrated";
type ViewMode = "list" | "grid";

const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: "recent", label: "Recentes" },
  { id: "score", label: "Score" },
  { id: "reviews", label: "Reviews" },
];

const SCORE_FILTERS: { id: ScoreFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "acclaimed", label: "90+" },
  { id: "recommended", label: "70–89" },
  { id: "mixed", label: "50–69" },
  { id: "unfavorable", label: "30–49" },
  { id: "rejected", label: "0–29" },
  { id: "unrated", label: "Sem nota" },
];

const SCORE_BANDS = [
  { min: 90, max: 100, color: "#1B873F", label: "Aclamação universal" },
  { min: 70, max: 89, color: "#34C759", label: "Muito recomendado" },
  { min: 50, max: 69, color: "#E09F00", label: "Recepção mista" },
  { min: 30, max: 49, color: "#FF9500", label: "Geralmente desfavorável" },
  { min: 0, max: 29, color: "#C5291C", label: "Repúdio generalizado" },
];

const CLUBE_PHASE_DOT: Record<ClubePhase, string> = {
  "0": "#86868B",
  "1": "#1B873F",
  "2": "#E09F00",
  "3": "#FA243C",
  "4": "#5856D6",
};

const CLUBE_PHASE_CTA: Record<ClubePhase, string> = {
  "0": "Ver clube",
  "1": "Indicar álbuns",
  "2": "Votar agora",
  "3": "Ver resultado",
  "4": "Ver clube",
};

function matchesScoreFilter(a: CriticsFMAlbum, f: ScoreFilter): boolean {
  if (f === "all") return true;
  if (f === "unrated") return a.reviewCount === 0;
  if (f === "acclaimed") return a.score >= 90 && a.reviewCount > 0;
  if (f === "recommended") return a.score >= 70 && a.score < 90 && a.reviewCount > 0;
  if (f === "mixed") return a.score >= 50 && a.score < 70 && a.reviewCount > 0;
  if (f === "unfavorable") return a.score >= 30 && a.score < 50 && a.reviewCount > 0;
  if (f === "rejected") return a.score < 30 && a.reviewCount > 0;
  return true;
}

function albumHue(title: string): number {
  return Math.abs(title.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)) % 360;
}

function AlbumCover({ url, title, size, radius = 8 }: { url: string | null; title: string; size: number; radius?: number }) {
  if (url) {
    return (
      <Image
        source={{ uri: resolveMediaUrl(url) }}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: `hsl(${albumHue(title)},50%,60%)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.36 }}>{title[0]?.toUpperCase()}</Text>
    </View>
  );
}

function UnratedBadge({ size, overlay }: { size: number; overlay?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        backgroundColor: overlay ? "rgba(0,0,0,0.55)" : colors.fillInset,
        borderWidth: overlay ? 0 : 1.5,
        borderColor: overlay ? "transparent" : colors.dividerStrong,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: overlay ? "#fff" : colors.textDisabled, fontWeight: "800", fontSize: size * 0.38 }}>-</Text>
    </View>
  );
}

function SpotifySearchPanel({
  initialQuery,
  onClose,
  onOpenAlbum,
}: {
  initialQuery: string;
  onClose: () => void;
  onOpenAlbum: (albumId: number) => void;
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState(initialQuery);
  const search = useSpotifyAlbumSearch(q);
  const addMutation = useAddSpotifyAlbumMutation();
  const results = search.data?.results ?? [];

  async function handleAdd(hit: SpotifyAlbumHit) {
    if (hit.inDb && hit.dbId) {
      onClose();
      onOpenAlbum(hit.dbId);
      return;
    }
    try {
      const data = await addMutation.mutateAsync(hit.spotifyId);
      onClose();
      onOpenAlbum(data.id);
    } catch {
      /* o botão volta ao estado normal pelo isPending */
    }
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              maxHeight: "88%",
              paddingBottom: Math.max(insets.bottom, 16),
            }}
          >
            <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 4 }}>
              <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: colors.dividerStrong }} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path
                  fill="#1DB954"
                  d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
                />
              </Svg>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: "700", color: colors.text }}>Buscar no Spotify</Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <Text style={{ fontSize: 22, color: colors.textMuted, lineHeight: 24 }}>×</Text>
              </Pressable>
            </View>
            <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
              <TextInput
                value={q}
                onChangeText={setQ}
                autoFocus
                placeholder="Nome do álbum ou artista"
                placeholderTextColor={colors.textMuted}
                style={{
                  backgroundColor: colors.fillInset,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.dividerStrong,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  fontSize: 14,
                  color: colors.text,
                }}
              />
            </View>
            {search.isFetching ? (
              <ActivityIndicator color={colors.text} style={{ paddingVertical: 28 }} />
            ) : q.trim() && results.length === 0 ? (
              <Text style={{ textAlign: "center", paddingVertical: 28, color: colors.textMuted, fontSize: 13 }}>
                Nenhum resultado encontrado.
              </Text>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(hit) => hit.spotifyId}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 420 }}
                renderItem={({ item: hit }) => {
                  const adding = addMutation.isPending && addMutation.variables === hit.spotifyId;
                  return (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
                      <AlbumCover url={hit.coverUrl} title={hit.title} size={48} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                          {hit.title}
                        </Text>
                        <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                          {hit.artist}
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.textDisabled, marginTop: 2 }}>
                          {[hit.releaseDate?.slice(0, 4), hit.albumType === "ALBUM" ? "LP" : hit.albumType]
                            .filter(Boolean)
                            .join(" · ")}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleAdd(hit)}
                        disabled={adding}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 7,
                          borderRadius: 100,
                          backgroundColor: hit.inDb ? colors.fillSubtle : colors.btnDarkBg,
                          opacity: adding ? 0.6 : 1,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "600", color: hit.inDb ? colors.text : colors.btnDarkFg }}>
                          {adding ? "…" : hit.inDb ? "Ver" : "Adicionar"}
                        </Text>
                      </Pressable>
                    </View>
                  );
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ReleaseCard({
  album,
  width,
  onPress,
}: {
  album: WeeklyReleaseAlbum;
  width: number;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} style={{ width }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.divider,
          overflow: "hidden",
        }}
      >
        <AlbumCover url={album.coverUrl} title={album.title} size={width} radius={0} />
        <View style={{ paddingHorizontal: 10, paddingTop: 9, paddingBottom: 10 }}>
          <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>
            {album.title}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
            {album.artist}
          </Text>
          {album.year ? (
            <Text style={{ fontSize: 11, color: colors.textDisabled, marginTop: 4 }}>{album.year}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function TopAlbumCard({ album, width, onPress }: { album: CriticsFMAlbum; width: number; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} style={{ width }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.divider,
          overflow: "hidden",
        }}
      >
        <View style={{ width, height: width, position: "relative" }}>
          <AlbumCover url={album.coverUrl} title={album.title} size={width} radius={0} />
          <View style={{ position: "absolute", bottom: 7, left: 7 }}>
            {album.reviewCount > 0 ? <ScoreSquare score={album.score} size={26} overlay /> : <UnratedBadge size={26} overlay />}
          </View>
        </View>
        <View style={{ paddingHorizontal: 10, paddingTop: 9, paddingBottom: 10 }}>
          <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>
            {album.title}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
            {album.artist}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function ListRow({ album, onPress }: { album: CriticsFMAlbum; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 11,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
      }}
    >
      <AlbumCover url={album.coverUrl} title={album.title} size={46} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
          {album.title}
        </Text>
        <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
          {album.reviewCount > 0
            ? `${album.artist} · ${album.reviewCount} ${album.reviewCount === 1 ? "review" : "reviews"}`
            : album.artist}
        </Text>
      </View>
      {album.reviewCount > 0 ? <ScoreSquare score={album.score} size={40} /> : <UnratedBadge size={40} />}
    </Pressable>
  );
}

function GridCard({ album, width, onPress }: { album: CriticsFMAlbum; width: number; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} style={{ width }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.divider,
          overflow: "hidden",
        }}
      >
        <View style={{ width, aspectRatio: 1, position: "relative" }}>
          <AlbumCover url={album.coverUrl} title={album.title} size={width} radius={0} />
          <View style={{ position: "absolute", bottom: 8, left: 8 }}>
            {album.reviewCount > 0 ? <ScoreSquare score={album.score} size={32} overlay /> : <UnratedBadge size={32} overlay />}
          </View>
        </View>
        <View style={{ paddingHorizontal: 10, paddingTop: 10, paddingBottom: 12 }}>
          <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
            {album.title}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
            {album.artist}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function CriticsFMScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { width: screenW } = useWindowDimensions();
  const hubQuery = useCriticsFMQuery();
  const clubeQuery = useClubeQuery();
  const albums = hubQuery.data?.albums ?? [];
  const weeklyRelease = hubQuery.data?.weeklyRelease ?? null;
  const clubeRound = clubeQuery.data?.round ?? null;

  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [sortBy, setSortBy] = useState<SortId>("recent");
  const [search, setSearch] = useState("");
  const [showCount, setShowCount] = useState(PAGE_SIZE);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [spotifyQuery, setSpotifyQuery] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = albums.filter((a) => {
      if (!matchesScoreFilter(a, scoreFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!a.title.toLowerCase().includes(q) && !a.artist.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if (sortBy === "score") list = [...list].sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount);
    else if (sortBy === "reviews") list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);
    else list = [...list].sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""));
    return list;
  }, [albums, scoreFilter, sortBy, search]);

  useEffect(() => {
    setShowCount(PAGE_SIZE);
  }, [scoreFilter, sortBy, search]);

  const paginated = filtered.slice(0, showCount);
  const hasMore = showCount < filtered.length;
  const showTop = scoreFilter === "all" && !search;
  const topAlbums = useMemo(
    () =>
      albums
        .filter((a) => a.reviewCount >= 2)
        .sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount)
        .slice(0, 6),
    [albums],
  );

  const openAlbum = (albumId: number) => navigation.navigate("AlbumDetail", { albumId });
  const carouselW = 130;
  const gridGap = 8;
  const gridPad = 16;
  const gridCardW = (screenW - gridPad * 2 - gridGap) / 2;

  const header = (
    <View>
      <Text
        style={{
          fontSize: 15,
          color: colors.textMuted,
          lineHeight: 22,
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 22,
        }}
      >
        Um espaço para avaliar álbuns, acompanhar lançamentos e participar do Clube do Álbum.
      </Text>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: "800", letterSpacing: -0.4, color: colors.text }}>
          Lançamentos da semana
        </Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
          {weeklyRelease
            ? weeklyRelease.albums.length === 1
              ? `Semana de ${weeklyRelease.weekLabel} · 1 álbum em destaque`
              : `Semana de ${weeklyRelease.weekLabel} · ${weeklyRelease.albums.length} álbuns em destaque`
            : "Álbuns em destaque para ouvir esta semana"}
        </Text>
      </View>
      {!weeklyRelease || weeklyRelease.albums.length === 0 ? (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 28,
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.divider,
            paddingVertical: 28,
            paddingHorizontal: 20,
          }}
        >
          <Text style={{ textAlign: "center", color: colors.textMuted, fontSize: 14 }}>
            Nenhum lançamento esta semana. Volte em breve.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 28 }}
        >
          {weeklyRelease.albums.map((album) => (
            <ReleaseCard
              key={album.albumId}
              album={album}
              width={carouselW}
              onPress={() => openAlbum(album.albumId)}
            />
          ))}
        </ScrollView>
      )}

      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "800", letterSpacing: -0.4, color: colors.text }}>Clube do Álbum</Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
          Curadoria coletiva semanal da comunidade.
        </Text>
      </View>
      <Pressable
        onPress={() => navigation.navigate("Clube")}
        style={{
          marginHorizontal: 16,
          marginBottom: 28,
          backgroundColor: colors.surface,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.divider,
          padding: 18,
        }}
      >
        {!clubeRound ? (
          <Text style={{ textAlign: "center", color: colors.textMuted, fontSize: 14, paddingVertical: 8 }}>
            Nenhuma rodada ativa no momento.
          </Text>
        ) : (
          <View>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    color: colors.textMuted,
                    marginBottom: 6,
                  }}
                >
                  Rodada #{clubeRound.number}
                </Text>
                <Text numberOfLines={1} style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>
                  {clubeRound.theme}
                </Text>
                <View
                  style={{
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 10,
                    backgroundColor: colors.fillInset,
                    borderRadius: 100,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: colors.divider,
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: clubeRound.phase === "3" ? colors.accent : CLUBE_PHASE_DOT[clubeRound.phase],
                    }}
                  />
                  <Text style={{ fontSize: 11, fontWeight: "600", color: colors.textSubtle }}>
                    {CLUBE_PHASE_LABELS[clubeRound.phase]}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  backgroundColor: colors.btnDarkBg,
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: 100,
                  alignSelf: "center",
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "700", color: colors.btnDarkFg }}>
                  {CLUBE_PHASE_CTA[clubeRound.phase]}
                </Text>
              </View>
            </View>
            <View
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.divider,
                flexDirection: "row",
                gap: 28,
              }}
            >
              <View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>{clubeRound.nominations.length}</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>indicações</Text>
              </View>
              <View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>{clubeRound.participantCount}</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>membros</Text>
              </View>
            </View>
          </View>
        )}
      </Pressable>

      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 28,
          backgroundColor: colors.surface,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.divider,
          padding: 18,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "800", letterSpacing: -0.4, color: colors.text }}>Escala de notas</Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 12 }}>
          Como a nota média de cada álbum é lida no CriticsFM.
        </Text>
        {SCORE_BANDS.map((band) => (
          <View
            key={band.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 10,
              borderTopWidth: 1,
              borderTopColor: colors.dividerSoft,
            }}
          >
            <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: band.color }} />
            <Text style={{ width: 56, fontSize: 13, fontWeight: "800", color: colors.text }}>
              {band.min}–{band.max}
            </Text>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: "600", color: colors.text }}>{band.label}</Text>
          </View>
        ))}
      </View>

      {showTop && topAlbums.length > 0 ? (
        <View style={{ marginBottom: 22 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color: colors.textMuted,
              paddingHorizontal: 16,
              marginBottom: 12,
            }}
          >
            Melhores avaliados
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          >
            {topAlbums.map((album) => (
              <TopAlbumCard key={album.id} album={album} width={carouselW} onPress={() => openAlbum(album.id)} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={{ paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar álbum ou artista"
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1,
              minWidth: 0,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: colors.dividerStrong,
              backgroundColor: colors.surface,
              fontSize: 13,
              color: colors.text,
            }}
          />
          <Pressable
            onPress={() => setSpotifyQuery(search.trim())}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#1DB954",
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 100,
            }}
          >
            <Svg width={13} height={13} viewBox="0 0 24 24">
              <Path
                fill="#fff"
                d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
              />
            </Svg>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Adicionar</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingTop: 10 }}
        >
          {SCORE_FILTERS.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => setScoreFilter(f.id)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 100,
                backgroundColor: scoreFilter === f.id ? colors.btnDarkBg : colors.fillInset,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: scoreFilter === f.id ? colors.btnDarkFg : colors.text,
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ flex: 1, fontSize: 12, color: colors.textMuted }}>
          {filtered.length === 1 ? "1 álbum" : `${filtered.length} álbuns`}
        </Text>
        <View style={{ flexDirection: "row", gap: 2, backgroundColor: colors.fillInset, borderRadius: 8, padding: 2 }}>
          {(["list", "grid"] as const).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setViewMode(mode)}
              style={{
                width: 30,
                height: 26,
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: viewMode === mode ? colors.surface : "transparent",
              }}
            >
              {mode === "list" ? (
                <Svg width={13} height={11} viewBox="0 0 13 11">
                  <Path d="M0 0h13v2H0zM0 4.5h13v2H0zM0 9h13v2H0z" fill={viewMode === "list" ? colors.text : colors.textMuted} />
                </Svg>
              ) : (
                <Svg width={12} height={12} viewBox="0 0 12 12">
                  <Path d="M0 0h5v5H0zM7 0h5v5H7zM0 7h5v5H0zM7 7h5v5H7z" fill={viewMode === "grid" ? colors.text : colors.textMuted} />
                </Svg>
              )}
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 3, backgroundColor: colors.fillInset, padding: 3, borderRadius: 10 }}>
          {SORT_OPTIONS.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => setSortBy(s.id)}
              style={{
                paddingHorizontal: 9,
                paddingVertical: 5,
                borderRadius: 7,
                backgroundColor: sortBy === s.id ? colors.surface : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: sortBy === s.id ? colors.text : colors.textMuted,
                }}
              >
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  if (hubQuery.isLoading) {
    return (
      <Screen scroll={false}>
        <BackHeader title="CriticsFM" />
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (hubQuery.isError) {
    return (
      <Screen scroll={false}>
        <BackHeader title="CriticsFM" />
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>
          Não foi possível carregar o CriticsFM.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <BackHeader title="CriticsFM" />
      {spotifyQuery !== null ? (
        <SpotifySearchPanel
          initialQuery={spotifyQuery}
          onClose={() => setSpotifyQuery(null)}
          onOpenAlbum={openAlbum}
        />
      ) : null}
      <FlatList
        key={viewMode}
        style={{ flex: 1 }}
        data={paginated}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        ListHeaderComponent={header}
        numColumns={viewMode === "grid" ? 2 : 1}
        columnWrapperStyle={viewMode === "grid" ? { gap: gridGap, paddingHorizontal: gridPad, marginBottom: gridGap } : undefined}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 8,
              backgroundColor: colors.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.divider,
              padding: 36,
              alignItems: "center",
            }}
          >
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={1.8}>
              <Circle cx={9} cy={18} r={3} />
              <Circle cx={18} cy={16} r={2.5} />
              <Path d="M9 15V5l9-2v11" strokeLinecap="round" />
            </Svg>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginTop: 12 }}>Nenhum álbum encontrado</Text>
            {search ? (
              <View style={{ alignItems: "center", marginTop: 12 }}>
                <Text style={{ fontSize: 13, color: colors.textDisabled, marginBottom: 12 }}>
                  Quer adicionar este álbum ao catálogo?
                </Text>
                <Pressable
                  onPress={() => setSpotifyQuery(search)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 7,
                    backgroundColor: "#1DB954",
                    paddingHorizontal: 18,
                    paddingVertical: 9,
                    borderRadius: 100,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>Buscar no Spotify</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <Pressable
              onPress={() => setShowCount((c) => c + PAGE_SIZE)}
              style={{
                alignSelf: "center",
                marginTop: 20,
                paddingHorizontal: 24,
                paddingVertical: 11,
                borderRadius: 100,
                borderWidth: 1,
                borderColor: colors.dividerStrong,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>
                Carregar mais ({Math.min(PAGE_SIZE, filtered.length - showCount)} de {filtered.length - showCount} restantes)
              </Text>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) =>
          viewMode === "grid" ? (
            <GridCard album={item} width={gridCardW} onPress={() => openAlbum(item.id)} />
          ) : (
            <ListRow album={item} onPress={() => openAlbum(item.id)} />
          )
        }
      />
    </Screen>
  );
}
