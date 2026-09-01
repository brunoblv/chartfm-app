import React from "react";
import { View, Text, Pressable, ActivityIndicator, Image, Alert, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useProfileQuery, useFollowMutation, useUserParadasQuery, familyLabel, ProfileFamilyProgress } from "../api/profile";
import { useStartConversationMutation } from "../api/conversas";
import { resolveMediaUrl } from "../lib/api";
import { ParadaChartCard } from "../components/ParadaChartCard";
import { AchievementDetailModal } from "../components/AchievementDetailModal";
import { SocialIcon } from "../components/SocialIcon";

type Route = RouteProp<RootStackParamList, "UserDetail">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function UserDetailScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const handle = route.params?.handle;
  const profileQuery = useProfileQuery(handle);
  const paradasQuery = useUserParadasQuery(handle);
  const followMutation = useFollowMutation();
  const startConversation = useStartConversationMutation();
  const profile = profileQuery.data;
  const paradas = paradasQuery.data?.paradas ?? [];
  const [selectedFamily, setSelectedFamily] = React.useState<ProfileFamilyProgress | null>(null);

  if (!handle) {
    return (
      <Screen>
        <BackHeader />
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>Perfil não encontrado.</Text>
      </Screen>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <Screen>
        <BackHeader />
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen>
        <BackHeader />
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>Perfil não encontrado.</Text>
      </Screen>
    );
  }

  const activeChart = profile.user.charts[0];

  const handleMessage = () => {
    startConversation.mutate(handle, {
      onSuccess: (data) => navigation.navigate("ConversationThread", { conversationId: data.id, handle, name: profile.user.name }),
      onError: () => Alert.alert("Não foi possível abrir a conversa", "Tente novamente."),
    });
  };

  return (
    <Screen>
      <BackHeader />

      <View style={{ alignItems: "center", paddingHorizontal: 24, paddingBottom: 20 }}>
        {profile.imageUrl ? (
          <Image source={{ uri: resolveMediaUrl(profile.imageUrl) }} style={{ width: 82, height: 82, borderRadius: 41 }} />
        ) : (
          <LinearGradient colors={["#8BC34A", "#CDDC39"]} style={{ width: 82, height: 82, borderRadius: 41, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 32 }}>{profile.user.name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
        )}
        <Text style={{ fontSize: 22, fontWeight: "800", letterSpacing: -0.6, color: colors.text, marginTop: 14 }}>{profile.user.name}</Text>
        <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 1 }}>@{profile.user.handle}</Text>

        {profile.user.bio ? (
          <Text style={{ fontSize: 13.5, lineHeight: 19, color: colors.textSubtle, textAlign: "center", marginTop: 10 }}>
            {profile.user.bio}
          </Text>
        ) : null}

        {profile.genres.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 10 }}>
            {profile.genres.map((g) => (
              <View key={g} style={{ backgroundColor: colors.fillSubtle, borderRadius: 100, paddingVertical: 5, paddingHorizontal: 11 }}>
                <Text style={{ fontSize: 11.5, fontWeight: "600", color: colors.text }}>{g}</Text>
              </View>
            ))}
          </View>
        )}

        {(profile.lastfmUser || profile.twitterUser || profile.instagramUser) && (
          <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
            {profile.lastfmUser && (
              <Pressable onPress={() => Linking.openURL(`https://www.last.fm/user/${profile.lastfmUser}`)} hitSlop={8}>
                <SocialIcon name="lastfm" size={18} />
              </Pressable>
            )}
            {profile.twitterUser && (
              <Pressable onPress={() => Linking.openURL(`https://x.com/${profile.twitterUser}`)} hitSlop={8}>
                <SocialIcon name="x-twitter" size={18} color={colors.text} />
              </Pressable>
            )}
            {profile.instagramUser && (
              <Pressable onPress={() => Linking.openURL(`https://instagram.com/${profile.instagramUser}`)} hitSlop={8}>
                <SocialIcon name="instagram" size={18} />
              </Pressable>
            )}
          </View>
        )}

        <View style={{ flexDirection: "row", justifyContent: "center", gap: 26, marginTop: 18 }}>
          <Pressable onPress={() => navigation.navigate("Followers", { handle, type: "followers" })} style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{profile.user.followers}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>seguidores</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Followers", { handle, type: "following" })} style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{profile.user.following}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>seguindo</Text>
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{profile.progression.unlocked}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>conquistas</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{profile.user.streak}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>sequência</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          <Pressable
            disabled={followMutation.isPending}
            onPress={() =>
              followMutation.mutate(profile.user.id, {
                onError: () => Alert.alert("Não foi possível seguir", "Tente novamente."),
              })
            }
            style={{
              backgroundColor: profile.isFollowing ? colors.fillSubtle : colors.accent,
              borderRadius: 100,
              paddingVertical: 12,
              paddingHorizontal: 30,
            }}
          >
            <Text style={{ color: profile.isFollowing ? colors.text : "#fff", fontWeight: "700", fontSize: 14.5 }}>
              {profile.isFollowing ? "Seguindo" : "Seguir"}
            </Text>
          </Pressable>
          <Pressable
            disabled={startConversation.isPending}
            onPress={handleMessage}
            style={{
              backgroundColor: colors.fillSubtle,
              borderRadius: 100,
              paddingVertical: 12,
              paddingHorizontal: 30,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14.5 }}>Mensagem</Text>
          </Pressable>
        </View>
      </View>

      {profile.statsSummary && (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 20,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.divider,
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
          }}
        >
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>
              {profile.statsSummary.totalRankedSlots}
            </Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: "center" }}>
              posições ocupadas{"\n"}em todas as paradas
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: colors.dividerSoft }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>
              {profile.statsSummary.numberOnes}
            </Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: "center" }}>
              músicas em{"\n"}#1
            </Text>
          </View>
        </View>
      )}

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 16, marginBottom: 8 }}>
        <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>Paradas</Text>
        <View style={{ flexDirection: "row", gap: 14 }}>
          {paradas.length > 1 && (
            <Pressable onPress={() => navigation.navigate("ParadasList", { handle })}>
              <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "700" }}>Ver todas ({paradas.length})</Text>
            </Pressable>
          )}
          <Pressable onPress={() => navigation.navigate("History", { handle })}>
            <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "700" }}>Histórico</Text>
          </Pressable>
        </View>
      </View>

      {activeChart ? (
        <ParadaChartCard
          chart={activeChart}
          onSeeAllPress={() => navigation.navigate("ChartDetail", { chartId: activeChart.id })}
          onPressEntry={(songId, spotifyId) => navigation.navigate("MusicDetail", { songId, spotifyId: spotifyId ?? undefined })}
          onPressArtist={(artistId) => navigation.navigate("ArtistDetail", { artistId })}
        />
      ) : (
        <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 20 }}>Sem parada publicada.</Text>
      )}

      <View style={{ paddingHorizontal: 20, paddingTop: 26, paddingBottom: 12 }}>
        <Text style={{ fontSize: 19, fontWeight: "800", letterSpacing: -0.4, color: colors.text }}>
          Conquistas · Nível {profile.progression.level.level}
        </Text>
      </View>
      <View style={{ marginHorizontal: 16, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {profile.progression.families.map((f) => (
          <Pressable
            key={f.code}
            onPress={() => setSelectedFamily(f)}
            style={{
              width: "47%",
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.divider,
              borderRadius: 14,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              opacity: f.tier ? 1 : 0.5,
            }}
          >
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontWeight: "800", fontSize: 11, color: colors.accent }}>{f.unlockedTiers}/4</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 12.5, fontWeight: "700", color: colors.text }}>
                {familyLabel(f.code)}
              </Text>
              <Text numberOfLines={1} style={{ fontSize: 10.5, color: colors.textMuted }}>
                {f.isComplete ? "Completo" : `${f.value} / ${f.nextThreshold}`}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <AchievementDetailModal family={selectedFamily} onClose={() => setSelectedFamily(null)} />
    </Screen>
  );
}
