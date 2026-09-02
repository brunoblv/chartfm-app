import React from "react";
import { View, Text, Pressable, Linking } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { Cover } from "../components/Cover";
import { CLUBE_COVER } from "../data/mock";
import { API_BASE_URL } from "../lib/api";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useCopaQuery, useCopaFixturesQuery } from "../api/copa";
import { usePushRoundQuery, pushPhaseLabel } from "../api/push";
import { useClubeQuery, CLUBE_PHASE_LABELS } from "../api/clube";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const COPA_STATUS_LABELS: Record<string, string> = {
  REGISTRATION: "Inscrições abertas",
  GROUP_STAGE: "Fase de grupos",
  KNOCKOUT: "Mata-mata",
  FINISHED: "Encerrada",
};

export function EventsScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const copaQuery = useCopaQuery();
  const copa = copaQuery.data?.copa;
  const fixturesQuery = useCopaFixturesQuery(copa?.id);
  const liveFixtures = (fixturesQuery.data?.fixtures ?? []).filter((f) => f.status === "LIVE");
  const votedCount = liveFixtures.filter((f) => f.myVote).length;
  const pushRoundQuery = usePushRoundQuery();
  const pushRound = pushRoundQuery.data?.round;
  const clubeQuery = useClubeQuery();
  const clubeRound = clubeQuery.data?.round;

  return (
    <Screen>
      <BackHeader title="Eventos" />
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text style={{ fontSize: 13.5, color: colors.textMuted, marginTop: 6 }}>
          {[copa, pushRound].filter(Boolean).length} acontecendo agora
        </Text>
      </View>

      {copa ? (
        <View style={{ marginHorizontal: 16, borderRadius: 18, padding: 20, backgroundColor: "#1D1D1F" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF7A8A" }} />
            <Text style={{ fontSize: 10.5, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: "#FF7A8A" }}>
              Acontecendo agora
            </Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", letterSpacing: -0.6, color: "#fff", marginTop: 10 }}>
            {copa.name}
          </Text>
          <Text style={{ fontSize: 13.5, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
            {COPA_STATUS_LABELS[copa.status] ?? copa.status}
          </Text>
          <Text style={{ fontSize: 12, opacity: 0.7, color: "#fff", lineHeight: 17, marginTop: 14 }}>
            {liveFixtures.length} confronto(s) abertos para votação agora. Você votou em {votedCount}.
          </Text>
          <Pressable
            onPress={() => navigation.navigate("Copa")}
            style={{ marginTop: 16, backgroundColor: colors.accent, borderRadius: 100, paddingVertical: 15, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Votar agora</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ marginHorizontal: 16, borderRadius: 18, padding: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>Nenhuma Copa ativa no momento.</Text>
        </View>
      )}

      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" }}>
            <Svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={2} strokeLinecap="round">
              <Path d="M13 2 4 14h6l-1 8 9-12h-6z" />
            </Svg>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>Push</Text>
            <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>
              {pushRound ? `${pushRound.title} · ${pushPhaseLabel(pushRound.phase)}` : "Nenhuma rodada ativa"}
            </Text>
          </View>
        </View>
        {pushRound?.phase === "SUBMISSION" ? (
          <Pressable
            onPress={() => Linking.openURL(`${API_BASE_URL}/votacao-da-semana`)}
            style={{ marginTop: 14, backgroundColor: colors.btnDarkBg, borderRadius: 100, paddingVertical: 13, alignItems: "center" }}
          >
            <Text style={{ color: colors.btnDarkFg, fontWeight: "700", fontSize: 13.5 }}>Ver enquetes da semana</Text>
          </Pressable>
        ) : pushRound?.phase === "LISTENING" || pushRound?.phase === "RANKING" ? (
          <Pressable
            onPress={() => navigation.navigate("PushRank")}
            style={{ marginTop: 14, backgroundColor: colors.btnDarkBg, borderRadius: 100, paddingVertical: 13, alignItems: "center" }}
          >
            <Text style={{ color: colors.btnDarkFg, fontWeight: "700", fontSize: 13.5 }}>Avaliar indicações</Text>
          </Pressable>
        ) : (
          <Text style={{ fontSize: 11.5, color: colors.textDisabled, marginTop: 10 }}>
            Rodada em "{pushRound ? pushPhaseLabel(pushRound.phase) : "—"}".
          </Text>
        )}
      </View>

      <Pressable
        onPress={() => navigation.navigate("Clube")}
        style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", gap: 14 }}
      >
        <Cover cover={CLUBE_COVER} size={54} rounded={12} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>Clube do Álbum</Text>
          <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 4 }}>
            {clubeRound ? `${clubeRound.theme} · ${CLUBE_PHASE_LABELS[clubeRound.phase]}` : "Nenhuma rodada ativa"}
          </Text>
        </View>
      </Pressable>

    </Screen>
  );
}
