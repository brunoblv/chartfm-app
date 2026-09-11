import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Image, TextInput, Alert } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { PillButton } from "../components/PillButton";
import {
  useClubeQuery,
  useClubeNominateMutation,
  useClubeRankMutation,
  clubeErrorMessage,
  CLUBE_PHASE_LABELS,
  ClubeNomination,
  ClubeWinner,
  ClubeCuratorPick,
} from "../api/clube";
import { useSearchQuery, SearchAlbum } from "../api/search";
import { resolveMediaUrl } from "../lib/api";

function AlbumCover({ url, size = 44 }: { url: string | null; size?: number }) {
  const { colors } = useAppTheme();
  if (url) return <Image source={{ uri: resolveMediaUrl(url) }} style={{ width: size, height: size, borderRadius: 10 }} />;
  return <View style={{ width: size, height: size, borderRadius: 10, backgroundColor: colors.fillSubtle }} />;
}

function NominationRow({ album }: { album: ClubeNomination }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, paddingHorizontal: 14 }}>
      <AlbumCover url={album.coverUrl} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{album.title}</Text>
        <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
          {album.artist} · {album.year}
        </Text>
        {album.nominatedBy && (
          <Text style={{ fontSize: 11, color: colors.textDisabled, marginTop: 1 }}>indicado por @{album.nominatedBy}</Text>
        )}
      </View>
    </View>
  );
}

/** Linha do ranking com setas para mover — mesma ideia do reorder mobile do site (sem drag nativo). */
function RankingRow({
  album,
  position,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  album: ClubeNomination;
  position: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, paddingHorizontal: 14 }}>
      <Text style={{ width: 20, textAlign: "center", fontSize: 13, fontWeight: "800", color: colors.textMuted }}>{position}</Text>
      <AlbumCover url={album.coverUrl} size={40} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text }}>{album.title}</Text>
        <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 1 }}>{album.artist}</Text>
      </View>
      <View style={{ gap: 4 }}>
        <Pressable
          disabled={!canMoveUp}
          onPress={onMoveUp}
          style={{ width: 28, height: 24, borderRadius: 7, borderWidth: 1, borderColor: colors.divider, alignItems: "center", justifyContent: "center", opacity: canMoveUp ? 1 : 0.3 }}
        >
          <Text style={{ color: colors.text, fontSize: 13 }}>↑</Text>
        </Pressable>
        <Pressable
          disabled={!canMoveDown}
          onPress={onMoveDown}
          style={{ width: 28, height: 24, borderRadius: 7, borderWidth: 1, borderColor: colors.divider, alignItems: "center", justifyContent: "center", opacity: canMoveDown ? 1 : 0.3 }}
        >
          <Text style={{ color: colors.text, fontSize: 13 }}>↓</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ResultRow({ album, isCurator }: { album: ClubeWinner | ClubeCuratorPick; isCurator?: boolean }) {
  const { colors } = useAppTheme();
  const votes = "votes" in album ? album.votes : null;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.dividerSoft }}>
      <AlbumCover url={album.coverUrl} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{album.title}</Text>
        <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted }}>
          {album.artist}
          {votes !== null && ` · ${votes} votos`}
          {isCurator && " · Escolha da moderação"}
        </Text>
      </View>
      {album.score != null && <Text style={{ fontSize: 13, fontWeight: "800", color: colors.accent }}>{album.score}</Text>}
    </View>
  );
}

function AlbumPicker({ onPick }: { onPick: (album: SearchAlbum) => void }) {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState("");
  const { data, isLoading } = useSearchQuery(query);
  const albums = data?.albums ?? [];

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.fillSubtle, borderRadius: 12, padding: 12, marginBottom: 10 }}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2} strokeLinecap="round">
          <Circle cx={11} cy={11} r={7} />
          <Path d="M20 20l-3.5-3.5" />
        </Svg>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="buscar álbum"
          placeholderTextColor={colors.textMuted}
          style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.text, padding: 0 }}
        />
      </View>
      {isLoading && <ActivityIndicator color={colors.text} />}
      {albums.map((a) => (
        <Pressable key={a.id} onPress={() => onPick(a)} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 }}>
          <AlbumCover url={a.coverUrl} size={36} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text }}>{a.title}</Text>
            <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted }}>{a.artist}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export function ClubeScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const clubeQuery = useClubeQuery();
  const round = clubeQuery.data?.round;
  const nominateMutation = useClubeNominateMutation();
  const rankMutation = useClubeRankMutation();

  const [picking, setPicking] = useState(false);
  const [pick, setPick] = useState<SearchAlbum | null>(null);
  const [ranking, setRanking] = useState<ClubeNomination[]>([]);

  const myNominationId = round?.myNominations?.[0]?.id ?? null;
  const toRank = round ? round.nominations.filter((a) => a.id !== myNominationId) : [];

  useEffect(() => {
    if (!round) return;
    const saved = round.myRankingNominationIds;
    if (saved && saved.length > 0) {
      const byId = new Map(toRank.map((a) => [a.id, a]));
      const ordered = saved.map((id) => byId.get(id)).filter((a): a is ClubeNomination => !!a);
      const missing = toRank.filter((a) => !saved.includes(a.id));
      setRanking([...ordered, ...missing]);
    } else {
      setRanking(toRank);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round?.id, myNominationId, round?.myRankingNominationIds?.join(",")]);

  const handleNominate = () => {
    if (!round || !pick) return;
    nominateMutation.mutate(
      { roundId: round.id, albumId: pick.id },
      { onError: (e) => Alert.alert("Não foi possível indicar", clubeErrorMessage(e)) }
    );
  };

  function moveUp(idx: number) {
    if (idx <= 0) return;
    setRanking((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }
  function moveDown(idx: number) {
    setRanking((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  const handleSubmitRanking = () => {
    if (!round) return;
    const positions = ranking.map((a, i) => ({ nominationId: a.id, position: i + 1 }));
    rankMutation.mutate(
      { roundId: round.id, positions },
      { onError: (e) => Alert.alert("Não foi possível salvar o ranking", clubeErrorMessage(e)) }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Clube do Álbum" />

      {clubeQuery.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : !round ? (
        <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 40 }}>Nenhuma rodada ativa.</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{round.theme}</Text>
            <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 4 }}>
              Rodada {round.number} · {CLUBE_PHASE_LABELS[round.phase]} · {round.participantCount} participante(s)
            </Text>
          </View>

          {round.phase === "1" && (
            <View style={{ paddingHorizontal: 20 }}>
              {round.myNominations && round.myNominations.length === 1 ? (
                <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
                  <Text style={{ padding: 14, paddingBottom: 6, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted }}>
                    Sua indicação
                  </Text>
                  <NominationRow album={round.myNominations[0]} />
                </View>
              ) : (
                <>
                  <Text style={{ fontSize: 13.5, color: colors.textMuted, marginBottom: 14 }}>
                    Escolha um álbum, qualquer álbum, para indicar nesta rodada.
                  </Text>
                  <View style={{ marginBottom: 14 }}>
                    {pick ? (
                      <Pressable
                        onPress={() => setPicking(true)}
                        style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 12, padding: 10 }}
                      >
                        <AlbumCover url={pick.coverUrl} size={36} />
                        <Text style={{ flex: 1, fontSize: 13.5, fontWeight: "600", color: colors.text }} numberOfLines={1}>
                          {pick.title} · {pick.artist}
                        </Text>
                      </Pressable>
                    ) : picking ? (
                      <AlbumPicker
                        onPick={(a) => {
                          setPick(a);
                          setPicking(false);
                        }}
                      />
                    ) : (
                      <Pressable
                        onPress={() => setPicking(true)}
                        style={{ borderWidth: 1, borderColor: colors.dividerStrong, borderStyle: "dashed", borderRadius: 12, padding: 14, alignItems: "center" }}
                      >
                        <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 13.5 }}>Escolher álbum</Text>
                      </Pressable>
                    )}
                  </View>
                  <PillButton
                    label="Enviar indicação"
                    onPress={handleNominate}
                    disabled={!pick}
                    loading={nominateMutation.isPending}
                  />
                </>
              )}
            </View>
          )}

          {round.phase === "2" && (
            <View style={{ paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 13.5, color: colors.textMuted, marginBottom: 10 }}>
                Ordene os álbuns indicados do melhor para o pior.
              </Text>
              {toRank.length === 0 ? (
                <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 16 }}>
                  Só há a sua própria indicação nesta rodada — nada para ranquear.
                </Text>
              ) : (
                <>
                  <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
                    {ranking.map((n, idx) => (
                      <RankingRow
                        key={n.id}
                        album={n}
                        position={idx + 1}
                        canMoveUp={idx > 0}
                        canMoveDown={idx < ranking.length - 1}
                        onMoveUp={() => moveUp(idx)}
                        onMoveDown={() => moveDown(idx)}
                      />
                    ))}
                  </View>
                  <PillButton label="Salvar ranking" onPress={handleSubmitRanking} loading={rankMutation.isPending} />
                </>
              )}
            </View>
          )}

          {(round.phase === "3" || round.phase === "4" || round.roundComplete) && (
            <View style={{ paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 10 }}>Álbuns da semana</Text>
              <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
                {round.winners.map((w) => (
                  <ResultRow key={w.nominationId} album={w} />
                ))}
                {round.curator && <ResultRow album={round.curator} isCurator />}
              </View>
            </View>
          )}

          {round.phase === "0" && (
            <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 20 }}>
              Inscrições abrem em breve.
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}
