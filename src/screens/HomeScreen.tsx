import React from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { Screen } from "../components/Screen";
import { OfflineBanner } from "../components/OfflineBanner";
import { ChartFMLogo } from "../components/ChartFMLogo";
import { PillButton } from "../components/PillButton";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/Card";
import { SongRow } from "../components/SongRow";
import { Cover } from "../components/Cover";
import { TRENDING } from "../data/mock";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useAuth } from "../state/AuthContext";
import { useGlobalSongsQuery, songItemToGlobalSong } from "../api/global";
import { useProgressionQuery } from "../api/progression";
import { useCopaQuery, useCopaFixturesQuery } from "../api/copa";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function BellIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round">
      <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
      <Path d="M10.3 21a2 2 0 0 0 3.4 0" />
    </Svg>
  );
}

export function HomeScreen() {
  const { colors } = useAppTheme();
  const { hasChart, showGamification, isOffline } = useAppState();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const songsQuery = useGlobalSongsQuery("weekly");
  const globalTop3 = (songsQuery.data?.items ?? []).slice(0, 3).map((s, i) => songItemToGlobalSong(s, i));
  const progressionQuery = useProgressionQuery(showGamification);
  const progression = progressionQuery.data?.progression;
  const firstName = (user?.name ?? "").split(" ")[0] || user?.handle || "";
  const copaQuery = useCopaQuery();
  const copa = copaQuery.data?.copa;
  const copaFixturesQuery = useCopaFixturesQuery(copa?.id);
  const copaLiveCount = (copaFixturesQuery.data?.fixtures ?? []).filter((f) => f.status === "LIVE" && !f.myVote).length;

  if (!hasChart) {
    return (
      <Screen>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 14 }}>
          <ChartFMLogo size={28} />
          <Text style={{ flex: 1, fontSize: 18, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>
            ChartFM
          </Text>
          <Pressable hitSlop={8} onPress={() => navigation.navigate("Notifications")}>
            <BellIcon color={colors.textMuted} />
          </Pressable>
        </View>

        <LinearGradient
          colors={[colors.gradientHero[0], colors.gradientHero[1]]}
          style={{ marginHorizontal: 16, borderRadius: 20, padding: 22 }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: "#fff", opacity: 0.85 }}>
            Bem-vindo
          </Text>
          <Text style={{ fontSize: 25, fontWeight: "800", letterSpacing: -0.6, color: "#fff", marginTop: 8, lineHeight: 29 }}>
            Crie sua própria parada musical
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 21, color: "#fff", opacity: 0.9, marginTop: 10, marginBottom: 20, maxWidth: 270 }}>
            Escolha suas favoritas, monte seu Top 20 e descubra como você se compara com outros fãs.
          </Text>
          <PillButton label="Criar meu primeiro Chart" variant="white" onPress={() => navigation.navigate("Editor")} />
          <Pressable
            onPress={() => navigation.navigate("Lastfm")}
            style={{
              marginTop: 10,
              backgroundColor: "rgba(255,255,255,0.16)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.34)",
              borderRadius: 100,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>Importar do Last.fm</Text>
          </Pressable>
        </LinearGradient>

        <SectionHeader title="Enquanto isso, no Global 100" />
        <Card>
          {globalTop3.map((s, i) => (
            <SongRow key={s.t} song={s} position={s.p} last={i === globalTop3.length - 1} />
          ))}
        </Card>
        <Pressable onPress={() => navigation.navigate("Global100")} style={{ paddingVertical: 14, alignItems: "center" }}>
          <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 14 }}>Ver o Global 100</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen>
      {isOffline && <OfflineBanner />}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 23, fontWeight: "800", letterSpacing: -0.6, color: colors.text }}>Olá{firstName ? `, ${firstName}` : ""}</Text>
        </View>
        <Pressable hitSlop={8} style={{ position: "relative" }} onPress={() => navigation.navigate("Notifications")}>
          <BellIcon color={colors.textMuted} />
          <View style={{ position: "absolute", top: -1, right: -1, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, borderWidth: 1.5, borderColor: colors.bg }} />
        </Pressable>
        <LinearGradient
          colors={[colors.gradientHero[0], colors.gradientHero[1]]}
          style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>{(user?.name ?? user?.handle ?? "?").charAt(0).toUpperCase()}</Text>
        </LinearGradient>
      </View>

      <View style={{ opacity: isOffline ? 0.55 : 1 }} pointerEvents={isOffline ? "none" : "auto"}>
      <LinearGradient
        colors={[colors.gradientHero[0], colors.gradientHero[1]]}
        style={{ marginHorizontal: 16, borderRadius: 18, padding: 20, flexDirection: "row", alignItems: "center", gap: 16 }}
      >
        <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round">
            <Path d="M3 12V9M7 12V6M11 12V3M15 12V7M19 12V5" />
          </Svg>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 11, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", color: "#fff", opacity: 0.85 }}>
            Minha parada · Semana 35
          </Text>
          <Text style={{ fontSize: 19, fontWeight: "700", letterSpacing: -0.5, color: "#fff", marginTop: 3 }}>
            Hora de atualizar
          </Text>
          <Text style={{ fontSize: 12.5, color: "#fff", opacity: 0.88, marginTop: 4 }}>faltam 2 dias · sequência de 82</Text>
        </View>
      </LinearGradient>

      <View style={{ marginHorizontal: 16, marginTop: 10 }}>
        <PillButton
          label="Atualizar meu Chart"
          variant="dark"
          onPress={() => navigation.navigate("Editor")}
        />
      </View>

      {showGamification && progression && (
        <View style={{ marginHorizontal: 16, marginTop: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 14, padding: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: "700", color: colors.text }}>Nível {progression.level}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>{progression.percent}%</Text>
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.fillSubtle, overflow: "hidden", marginTop: 9 }}>
            <View style={{ width: `${progression.percent}%`, height: "100%", backgroundColor: colors.accent }} />
          </View>
        </View>
      )}

      <SectionHeader title="Em alta para você" action="Ver mais" />
      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16 }}>
        {TRENDING.map((c) => (
          <View key={c.t} style={{ width: 132 }}>
            <Cover cover={c.cover} size={132} rounded={14} />
            <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text, marginTop: 8 }}>
              {c.t}
            </Text>
            <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted }}>
              {c.a}
            </Text>
            <Text style={{ fontSize: 11, color: colors.accent, fontWeight: "600", marginTop: 4 }}>{c.why}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Global 100" action="Ver os 100" onAction={() => navigation.navigate("Global100")} />
      <Card>
        {globalTop3.map((s, i) => (
          <SongRow key={s.t} song={s} position={s.p} last={i === globalTop3.length - 1} />
        ))}
      </Card>

      {copa ? (
        <>
          <SectionHeader title="Eventos" />
          <View
            style={{
              marginHorizontal: 16,
              borderRadius: 16,
              padding: 18,
              backgroundColor: "#1D1D1F",
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <LinearGradient colors={["#FA243C", "#FF5858"]} style={{ width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" }}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round">
                <Path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z" />
                <Path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
              </Svg>
            </LinearGradient>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>{copa.name}</Text>
              <Text style={{ fontSize: 12.5, color: "rgba(255,255,255,0.72)", marginTop: 2 }}>
                {copaLiveCount > 0 ? `${copaLiveCount} confronto(s) esperando seu voto` : "Nenhum confronto pendente"}
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate("Copa")}
              style={{ backgroundColor: colors.accent, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 9 }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>VOTAR</Text>
            </Pressable>
          </View>
        </>
      ) : null}

      <SectionHeader title="Atividade" />
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderBottomWidth: 1, borderBottomColor: colors.dividerSoft }}>
          <LinearGradient colors={["#7C4DFF", "#00C6FF"]} style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>M</Text>
          </LinearGradient>
          <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 18, color: colors.text }}>
            <Text style={{ fontWeight: "700" }}>Maria</Text> comentou na sua parada da semana 34.
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 13 }}>
          <LinearGradient colors={["#2E7D6E", "#9BE15D"]} style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>R</Text>
          </LinearGradient>
          <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 18, color: colors.text }}>
            <Text style={{ fontWeight: "700" }}>Rafa</Text> começou a seguir você.
          </Text>
        </View>
      </Card>
      </View>
    </Screen>
  );
}
