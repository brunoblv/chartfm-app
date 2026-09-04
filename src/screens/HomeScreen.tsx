import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Image, ActivityIndicator } from "react-native";
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
import { RootStackParamList } from "../navigation/RootNavigator";
import { useAuth } from "../state/AuthContext";
import { useGlobalSongsQuery, songItemToGlobalSong } from "../api/global";
import { useCopaQuery, useCopaFixturesQuery } from "../api/copa";
import { useProfileQuery } from "../api/profile";
import { useRecommendationsQuery } from "../api/discover";
import { useNotificationsQuery } from "../api/notifications";
import { useHomeHubQuery, useHomeDiscoveryQuery } from "../api/homeHub";
import { resolveMediaUrl } from "../lib/api";
import { WeekStatusCard } from "../components/home/WeekStatusCard";
import { WeeklyRecapCard } from "../components/home/WeeklyRecapCard";
import { FriendChartsRow } from "../components/home/FriendChartsRow";
import { PeopleToMeetRow } from "../components/home/PeopleToMeetRow";
import { ReviewsRow } from "../components/home/ReviewsRow";
import { ReleasesRow } from "../components/home/ReleasesRow";
import { FeedList } from "../components/feed/FeedList";
import { FeedTab as FeedTabType } from "../api/feed";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function BellIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round">
      <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
      <Path d="M10.3 21a2 2 0 0 0 3.4 0" />
    </Svg>
  );
}

function HomeHeader({
  firstName,
  imageUrl,
  hasUnread,
  onBell,
}: {
  firstName: string;
  imageUrl?: string | null;
  hasUnread: boolean;
  onBell: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 10 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 23, fontWeight: "800", letterSpacing: -0.6, color: colors.text }}>
          Olá{firstName ? `, ${firstName}` : ""}
        </Text>
      </View>
      <Pressable hitSlop={8} style={{ position: "relative" }} onPress={onBell}>
        <BellIcon color={colors.textMuted} />
        {hasUnread && (
          <View style={{ position: "absolute", top: -1, right: -1, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, borderWidth: 1.5, borderColor: colors.bg }} />
        )}
      </Pressable>
      {imageUrl ? (
        <Image source={{ uri: resolveMediaUrl(imageUrl) }} style={{ width: 34, height: 34, borderRadius: 17 }} />
      ) : (
        <LinearGradient
          colors={[colors.gradientHero[0], colors.gradientHero[1]]}
          style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>{firstName.charAt(0).toUpperCase() || "?"}</Text>
        </LinearGradient>
      )}
    </View>
  );
}

function InicioTab() {
  const { colors } = useAppTheme();
  const { isOffline } = useAppState();
  const navigation = useNavigation<Nav>();
  const songsQuery = useGlobalSongsQuery("weekly");
  const globalTop3 = (songsQuery.data?.items ?? []).slice(0, 3).map((s, i) => songItemToGlobalSong(s, i));
  const copaQuery = useCopaQuery();
  const copa = copaQuery.data?.copa;
  const copaFixturesQuery = useCopaFixturesQuery(copa?.id);
  const copaLiveCount = (copaFixturesQuery.data?.fixtures ?? []).filter((f) => f.status === "LIVE" && !f.myVote).length;
  const recommendationsQuery = useRecommendationsQuery();
  const hubQuery = useHomeHubQuery(true);
  const hub = hubQuery.data;
  const discoveryQuery = useHomeDiscoveryQuery();
  const discovery = discoveryQuery.data;

  return (
    <View style={{ opacity: isOffline ? 0.55 : 1 }}>
      {hub?.weekStatus && (
        <WeekStatusCard
          status={hub.weekStatus}
          onPublish={() => navigation.navigate("ChooseParada", { next: "Editor" })}
          onViewChart={() =>
            hub.weekStatus.thisWeekChartId
              ? navigation.navigate("ChartDetail", { chartId: hub.weekStatus.thisWeekChartId })
              : navigation.navigate("Editor")
          }
        />
      )}

      {hub?.recap && (
        <View style={{ marginTop: 14 }}>
          <WeeklyRecapCard recap={hub.recap} />
        </View>
      )}

      {hub && hub.friendCharts.length > 0 && (
        <>
          <SectionHeader title="Charts de quem você segue" />
          <FriendChartsRow charts={hub.friendCharts} onPress={(handle) => navigation.navigate("UserDetail", { handle })} />
        </>
      )}

      {recommendationsQuery.cards.length > 0 && (
        <>
          <SectionHeader title="Em alta para você" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
            {recommendationsQuery.cards.map((c) => (
              <Pressable key={c.key} onPress={() => navigation.navigate("MusicDetail", { songId: c.songId })} style={{ width: 132 }}>
                <Cover cover={c.cover} size={132} rounded={14} />
                <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text, marginTop: 8 }}>
                  {c.t}
                </Text>
                <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted }}>
                  {c.a}
                </Text>
                <Text style={{ fontSize: 11, color: colors.accent, fontWeight: "600", marginTop: 4 }}>{c.why}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      <SectionHeader title="Global 100" action="Ver os 100" onAction={() => navigation.navigate("Global100")} />
      <Card>
        {globalTop3.map((s, i) => (
          <SongRow
            key={s.t}
            song={s}
            position={s.p}
            last={i === globalTop3.length - 1}
            onPress={s.songId ? () => navigation.navigate("MusicDetail", { songId: s.songId!, spotifyId: s.spotifyId ?? undefined }) : undefined}
          />
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

      {hub && hub.people.length > 0 && (
        <>
          <SectionHeader title="Pessoas para conhecer" />
          <PeopleToMeetRow people={hub.people} onPress={(handle) => navigation.navigate("UserDetail", { handle })} />
        </>
      )}

      {discovery && discovery.reviews.length > 0 && (
        <>
          <SectionHeader title="Reviews em destaque" />
          <ReviewsRow reviews={discovery.reviews} />
        </>
      )}

      {discovery?.releases && discovery.releases.albums.length > 0 && (
        <>
          <SectionHeader title="Lançamentos" />
          <ReleasesRow albums={discovery.releases.albums} />
        </>
      )}

      <View style={{ height: 20 }} />
    </View>
  );
}

function FeedTab() {
  const { colors } = useAppTheme();
  const [feedTab, setFeedTab] = useState<FeedTabType>("for-you");

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 10 }}>
        {([
          { id: "for-you" as const, label: "Para você" },
          { id: "following" as const, label: "Seguindo" },
        ]).map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setFeedTab(t.id)}
            style={{
              backgroundColor: feedTab === t.id ? colors.btnDarkBg : colors.fillSubtle,
              borderRadius: 100,
              paddingVertical: 8,
              paddingHorizontal: 14,
            }}
          >
            <Text style={{ color: feedTab === t.id ? colors.btnDarkFg : colors.textSubtle, fontWeight: "700", fontSize: 12.5 }}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        <FeedList tab={feedTab} />
      </View>
    </View>
  );
}

export function HomeScreen() {
  const { colors } = useAppTheme();
  const { isOffline } = useAppState();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const profileQuery = useProfileQuery(user?.handle);
  const hasChart = Boolean(profileQuery.data?.user.charts[0]);
  const onboardingSongsQuery = useGlobalSongsQuery("weekly");
  const onboardingGlobalTop3 = (onboardingSongsQuery.data?.items ?? []).slice(0, 3).map((s, i) => songItemToGlobalSong(s, i));
  const notificationsQuery = useNotificationsQuery(true);
  const hasUnreadNotifications = (notificationsQuery.data ?? []).some((n) => !n.read);
  const firstName = (user?.name ?? "").split(" ")[0] || user?.handle || "";
  const [tab, setTab] = useState<"inicio" | "feed">("inicio");

  if (profileQuery.isLoading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.text} style={{ marginTop: 60 }} />
      </Screen>
    );
  }

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
            Escolha suas favoritas, monte sua parada pessoal e descubra como você se compara com outros fãs.
          </Text>
          <PillButton label="Criar meu primeiro Chart" variant="white" onPress={() => navigation.navigate("ChooseParada", { next: "Editor" })} />
          <Pressable
            onPress={() => navigation.navigate("ChooseParada", { next: "Lastfm" })}
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
          {onboardingGlobalTop3.map((s, i) => (
            <SongRow key={s.t} song={s} position={s.p} last={i === onboardingGlobalTop3.length - 1} />
          ))}
        </Card>
        <Pressable onPress={() => navigation.navigate("Global100")} style={{ paddingVertical: 14, alignItems: "center" }}>
          <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 14 }}>Ver o Global 100</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen scroll={tab === "inicio"}>
      {isOffline && <OfflineBanner />}
      <HomeHeader
        firstName={firstName}
        imageUrl={profileQuery.data?.imageUrl}
        hasUnread={hasUnreadNotifications}
        onBell={() => navigation.navigate("Notifications")}
      />

      <View style={{ flexDirection: "row", marginHorizontal: 16, marginBottom: 14, backgroundColor: colors.fillSubtle, borderRadius: 100, padding: 3 }}>
        {(["inicio", "feed"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 100,
              alignItems: "center",
              backgroundColor: tab === t ? colors.surface : "transparent",
            }}
          >
            <Text style={{ fontSize: 13.5, fontWeight: "700", color: tab === t ? colors.text : colors.textMuted }}>
              {t === "inicio" ? "Início" : "Feed"}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "inicio" ? <InicioTab /> : <FeedTab />}
    </Screen>
  );
}
