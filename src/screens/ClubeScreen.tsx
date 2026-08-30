import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Image, TextInput, Alert } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { PillButton } from "../components/PillButton";
import { useClubeQuery, useClubeNominateMutation, useClubeVoteMutation, clubeErrorMessage, CLUBE_PHASE_LABELS, ClubeNomination, ClubeWinner } from "../api/clube";
import { useSearchQuery, SearchAlbum } from "../api/search";

function AlbumCover({ url, size = 44 }: { url: string | null; size?: number }) {
  const { colors } = useAppTheme();
  if (url) return <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: 10 }} />;
  return <View style={{ width: size, height: size, borderRadius: 10, backgroundColor: colors.fillSubtle }} />;
}

function NominationRow({
  album,
  onPress,
  selected,
  showCheckbox,
}: {
  album: ClubeNomination;
  onPress?: () => void;
  selected?: boolean;
  showCheckbox?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, paddingHorizontal: 14 }}
    >
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
      {showCheckbox && (
        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? colors.accent : colors.dividerStrong, backgroundColor: selected ? colors.accent : "transparent", alignItems: "center", justifyContent: "center" }}>
          {selected && (
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round">
              <Path d="M20 6 9 17l-5-5" />
            </Svg>
          )}
        </View>
      )}
    </Pressable>
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
  const voteMutation = useClubeVoteMutation();

  const [picking, setPicking] = useState<1 | 2 | null>(null);
  const [pick1, setPick1] = useState<SearchAlbum | null>(null);
  const [pick2, setPick2] = useState<SearchAlbum | null>(null);
  const [selectedVotes, setSelectedVotes] = useState<Set<string>>(new Set());

  const handleNominate = () => {
    if (!round || !pick1 || !pick2) return;
    nominateMutation.mutate(
      { roundId: round.id, albumIds: [pick1.id, pick2.id] },
      { onError: (e) => Alert.alert("Não foi possível indicar", clubeErrorMessage(e)) }
    );
  };

  const toggleVote = (id: string) => {
    setSelectedVotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleVote = () => {
    if (!round) return;
    if (selectedVotes.size < round.minPollVotes) {
      Alert.alert("Selecione mais álbuns", `Escolha pelo menos ${round.minPollVotes} álbuns.`);
      return;
    }
    voteMutation.mutate(
      { roundId: round.id, nominationIds: [...selectedVotes] },
      { onError: (e) => Alert.alert("Não foi possível votar", clubeErrorMessage(e)) }
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
              {round.myNominations && round.myNominations.length === 2 ? (
                <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
                  <Text style={{ padding: 14, paddingBottom: 6, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted }}>
                    Suas indicações
                  </Text>
                  {round.myNominations.map((n) => (
                    <NominationRow key={n.id} album={n} />
                  ))}
                </View>
              ) : (
                <>
                  <Text style={{ fontSize: 13.5, color: colors.textMuted, marginBottom: 14 }}>
                    Escolha dois álbuns para indicar nesta rodada.
                  </Text>
                  {[1, 2].map((slot) => {
                    const picked = slot === 1 ? pick1 : pick2;
                    return (
                      <View key={slot} style={{ marginBottom: 14 }}>
                        <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted, marginBottom: 6 }}>ÁLBUM {slot}</Text>
                        {picked ? (
                          <Pressable
                            onPress={() => setPicking(slot as 1 | 2)}
                            style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 12, padding: 10 }}
                          >
                            <AlbumCover url={picked.coverUrl} size={36} />
                            <Text style={{ flex: 1, fontSize: 13.5, fontWeight: "600", color: colors.text }} numberOfLines={1}>
                              {picked.title} · {picked.artist}
                            </Text>
                          </Pressable>
                        ) : picking === slot ? (
                          <AlbumPicker
                            onPick={(a) => {
                              if (slot === 1) setPick1(a);
                              else setPick2(a);
                              setPicking(null);
                            }}
                          />
                        ) : (
                          <Pressable
                            onPress={() => setPicking(slot as 1 | 2)}
                            style={{ borderWidth: 1, borderColor: colors.dividerStrong, borderStyle: "dashed", borderRadius: 12, padding: 14, alignItems: "center" }}
                          >
                            <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 13.5 }}>Escolher álbum</Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                  <PillButton
                    label="Enviar indicações"
                    onPress={handleNominate}
                    disabled={!pick1 || !pick2}
                    loading={nominateMutation.isPending}
                  />
                </>
              )}
            </View>
          )}

          {round.phase === "2" && (
            <View style={{ paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 13.5, color: colors.textMuted, marginBottom: 10 }}>
                Selecione pelo menos {round.minPollVotes} álbuns.
              </Text>
              <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
                {round.nominations.map((n) => (
                  <NominationRow
                    key={n.id}
                    album={n}
                    showCheckbox
                    selected={selectedVotes.has(n.id)}
                    onPress={() => toggleVote(n.id)}
                  />
                ))}
              </View>
              <PillButton label="Enviar votos" onPress={handleVote} loading={voteMutation.isPending} />
            </View>
          )}

          {(round.phase === "3" || round.phase === "4" || round.roundComplete) && (
            <View style={{ paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 10 }}>Vencedores</Text>
              <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
                {round.winners.map((w: ClubeWinner) => (
                  <View key={w.nominationId} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.dividerSoft }}>
                    <Text style={{ width: 20, fontSize: 16, fontWeight: "800", color: colors.text }}>{w.rank}</Text>
                    <AlbumCover url={w.coverUrl} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{w.title}</Text>
                      <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted }}>{w.artist} · {w.votes} votos</Text>
                    </View>
                    {w.score != null && (
                      <Text style={{ fontSize: 13, fontWeight: "800", color: colors.accent }}>{w.score}</Text>
                    )}
                  </View>
                ))}
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
