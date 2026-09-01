import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Image, ActivityIndicator, Alert } from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";
import { PillButton } from "../components/PillButton";
import { resolveMediaUrl } from "../lib/api";
import { useCopaQuery, useCopaFixturesQuery, useCopaVoteMutation, copaErrorMessage, CopaArtistInfo, CopaFixture } from "../api/copa";

const PHASE_LABELS: Record<string, string> = {
  GROUP: "Fase de grupos",
  R32: "Fase de 32",
  R16: "Oitavas de final",
  QF: "Quartas de final",
  SF: "Semifinal",
  THIRD_PLACE: "Disputa de 3º lugar",
  FINAL: "Final",
};

function ArtistArt({ artist, size }: { artist: CopaArtistInfo; size: number }) {
  if (artist.artistImage) {
    return (
      <Image
        source={{ uri: resolveMediaUrl(artist.artistImage) }}
        style={{ width: size, height: size, borderRadius: size * 0.16 }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.16,
        backgroundColor: artist.artistColor || "#1D1D1F",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.32 }}>{artist.artistInitials}</Text>
    </View>
  );
}

export function CopaScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const copaQuery = useCopaQuery();
  const copa = copaQuery.data?.copa;
  const fixturesQuery = useCopaFixturesQuery(copa?.id);
  const voteMutation = useCopaVoteMutation(copa?.id);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);

  const liveFixtures = useMemo(
    () => (fixturesQuery.data?.fixtures ?? []).filter((f) => f.status === "LIVE"),
    [fixturesQuery.data]
  );
  const fixture: CopaFixture | undefined =
    liveFixtures.find((f) => f.id === selectedFixtureId) ?? liveFixtures.find((f) => !f.myVote) ?? liveFixtures[0];

  const voted = Boolean(fixture?.myVote);
  const totalVotes = (fixture?.votesA ?? 0) + (fixture?.votesB ?? 0);

  const handleVote = (side: "A" | "B") => {
    if (!fixture || fixture.myVote || voteMutation.isPending) return;
    voteMutation.mutate(
      { fixtureId: fixture.id, side },
      { onError: (error) => Alert.alert("Não foi possível votar", copaErrorMessage(error)) }
    );
  };

  const Option = ({ side, artist }: { side: "A" | "B"; artist: CopaArtistInfo }) => {
    if (!fixture) return null;
    const goals = side === "A" ? fixture.goalsA : fixture.goalsB;
    const votes = side === "A" ? fixture.votesA : fixture.votesB;
    const singleName = side === "A" ? fixture.singleAName : fixture.singleBName;
    const active = fixture.myVote === side;
    const votePct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

    return (
      <Pressable
        onPress={() => handleVote(side)}
        disabled={voted}
        style={{
          borderWidth: 2,
          borderColor: active ? colors.accent : colors.divider,
          backgroundColor: colors.surface,
          borderRadius: 18,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <ArtistArt artist={artist} size={76} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 17, fontWeight: "700", letterSpacing: -0.4, color: colors.text }}>
            {artist.artistName}
          </Text>
          {singleName ? (
            <Text numberOfLines={1} style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
              {singleName}
            </Text>
          ) : null}
          <Text style={{ fontSize: 11, color: colors.textDisabled, marginTop: 2 }}>por @{artist.ownerHandle}</Text>
          {voted && (
            <View style={{ marginTop: 9 }}>
              <View style={{ height: 7, borderRadius: 4, backgroundColor: colors.fillSubtle, overflow: "hidden" }}>
                <View style={{ width: `${votePct}%`, height: "100%", backgroundColor: active ? colors.accent : colors.textMuted }} />
              </View>
              <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 5 }}>{votes} votos · {votePct}%</Text>
            </View>
          )}
        </View>
        {voted && (
          <Text style={{ fontSize: 30, fontWeight: "800", color: colors.text, letterSpacing: -1 }}>{goals}</Text>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
        >
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round">
            <Path d="M15 18l-6-6 6-6" />
          </Svg>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", letterSpacing: -0.4, color: colors.text }}>{copa?.name ?? "Copa"}</Text>
          {fixture ? (
            <Text style={{ fontSize: 11.5, color: colors.textMuted }}>
              {PHASE_LABELS[fixture.phase] ?? fixture.phase}
              {fixture.groupLetter ? ` · Grupo ${fixture.groupLetter}` : ""}
            </Text>
          ) : null}
        </View>
      </View>

      {copaQuery.isLoading || fixturesQuery.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 60 }} />
      ) : !copa ? (
        <Text style={{ paddingTop: 60, paddingHorizontal: 20, textAlign: "center", color: colors.textMuted }}>
          Nenhuma Copa ativa no momento.
        </Text>
      ) : !fixture ? (
        <Text style={{ paddingTop: 60, paddingHorizontal: 20, textAlign: "center", color: colors.textMuted }}>
          Nenhum confronto disponível para votação agora.
        </Text>
      ) : (
        <>
          <View style={{ paddingHorizontal: 20, paddingBottom: 18 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", letterSpacing: -0.6, lineHeight: 28, color: colors.text }}>
              Qual artista avança?
            </Text>
          </View>

          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            <Option side="A" artist={fixture.artistA} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
              <Text style={{ fontSize: 12, fontWeight: "800", color: colors.textMuted, letterSpacing: 1 }}>
                {voted ? `${fixture.goalsA} x ${fixture.goalsB}` : "VS"}
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
            </View>
            <Option side="B" artist={fixture.artistB} />
          </View>

          {voted ? (
            <>
              <View
                style={{
                  marginHorizontal: 16,
                  marginTop: 18,
                  backgroundColor: colors.upBg,
                  borderRadius: 14,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 9,
                }}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.upFg} strokeWidth={2.4} strokeLinecap="round">
                  <Path d="M20 6 9 17l-5-5" />
                </Svg>
                <Text style={{ color: colors.upFg, fontSize: 13.5, fontWeight: "600", flex: 1 }}>
                  Voto registrado. {totalVotes} pessoas já votaram.
                </Text>
              </View>
              {liveFixtures.length > 1 && (
                <View style={{ padding: 16 }}>
                  <PillButton
                    label="Próximo confronto"
                    onPress={() => {
                      const next = liveFixtures.find((f) => f.id !== fixture.id && !f.myVote);
                      setSelectedFixtureId(next?.id ?? null);
                    }}
                  />
                </View>
              )}
            </>
          ) : (
            <Text style={{ paddingTop: 20, paddingHorizontal: 16, fontSize: 12.5, color: colors.textMuted, textAlign: "center" }}>
              {voteMutation.isPending ? "Registrando voto…" : "Toque em um artista para votar. Um voto por confronto."}
            </Text>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
