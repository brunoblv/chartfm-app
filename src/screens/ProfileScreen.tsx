import React from "react";
import { View, Text, Pressable, ActivityIndicator, Image, Linking } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { useAuth } from "../state/AuthContext";
import { Screen } from "../components/Screen";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useProfileQuery, useUserParadasQuery, familyLabel, ProfileFamilyProgress } from "../api/profile";
import { useUnreadConversationsQuery } from "../api/conversas";
import { resolveMediaUrl } from "../lib/api";
import { AchievementDetailModal } from "../components/AchievementDetailModal";
import { ParadaChartCard } from "../components/ParadaChartCard";
import { SocialIcon } from "../components/SocialIcon";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const { colors } = useAppTheme();
  const { showGamification } = useAppState();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const profileQuery = useProfileQuery(user?.handle);
  const paradasQuery = useUserParadasQuery(user?.handle);
  const unreadQuery = useUnreadConversationsQuery();
  const profile = profileQuery.data;
  const activeChart = profile?.user.charts[0];
  const paradas = paradasQuery.data?.paradas ?? [];
  const [selectedFamily, setSelectedFamily] = React.useState<ProfileFamilyProgress | null>(null);

  return (
    <Screen>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 16, paddingBottom: 4, gap: 10 }}>
        <Pressable
          onPress={() => navigation.navigate("Conversas")}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSubtle} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </Svg>
          {(unreadQuery.data?.unread ?? 0) > 0 && (
            <View style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent, borderWidth: 1.5, borderColor: colors.bg }} />
          )}
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Settings")}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
        >
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.textSubtle} strokeWidth={1.9} strokeLinecap="round">
            <Circle cx={12} cy={12} r={3} />
            <Path d="M12 3v2M12 19v2M4.5 7.5l1.7 1M17.8 15.5l1.7 1M4.5 16.5l1.7-1M17.8 8.5l1.7-1" />
          </Svg>
        </Pressable>
      </View>

      {profileQuery.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={{ alignItems: "center", paddingHorizontal: 24, paddingBottom: 20 }}>
            {profile?.imageUrl ? (
              <Image source={{ uri: resolveMediaUrl(profile.imageUrl) }} style={{ width: 82, height: 82, borderRadius: 41 }} />
            ) : (
              <LinearGradient colors={[colors.gradientHero[0], colors.gradientHero[1]]} style={{ width: 82, height: 82, borderRadius: 41, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 32 }}>
                  {(user?.name ?? user?.handle ?? "?").charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            <Text style={{ fontSize: 22, fontWeight: "800", letterSpacing: -0.6, color: colors.text, marginTop: 14 }}>
              {user?.name ?? user?.handle}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 1 }}>@{user?.handle}</Text>

            {profile?.user.bio ? (
              <Text style={{ fontSize: 13.5, lineHeight: 19, color: colors.textSubtle, textAlign: "center", marginTop: 10 }}>
                {profile.user.bio}
              </Text>
            ) : null}

            {profile && profile.genres.length > 0 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 10 }}>
                {profile.genres.map((g) => (
                  <View key={g} style={{ backgroundColor: colors.fillSubtle, borderRadius: 100, paddingVertical: 5, paddingHorizontal: 11 }}>
                    <Text style={{ fontSize: 11.5, fontWeight: "600", color: colors.text }}>{g}</Text>
                  </View>
                ))}
              </View>
            )}

            {(profile?.lastfmUser || profile?.twitterUser || profile?.instagramUser) && (
              <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
                {profile.lastfmUser && (
                  <Pressable
                    onPress={() => Linking.openURL(`https://www.last.fm/user/${profile.lastfmUser}`)}
                    hitSlop={8}
                  >
                    <SocialIcon name="lastfm" size={18} />
                  </Pressable>
                )}
                {profile.twitterUser && (
                  <Pressable onPress={() => Linking.openURL(`https://x.com/${profile.twitterUser}`)} hitSlop={8}>
                    <SocialIcon name="x-twitter" size={18} color={colors.text} />
                  </Pressable>
                )}
                {profile.instagramUser && (
                  <Pressable
                    onPress={() => Linking.openURL(`https://instagram.com/${profile.instagramUser}`)}
                    hitSlop={8}
                  >
                    <SocialIcon name="instagram" size={18} />
                  </Pressable>
                )}
              </View>
            )}

            <View style={{ flexDirection: "row", justifyContent: "center", gap: 26, marginTop: 18 }}>
              <Pressable
                onPress={() => user && navigation.navigate("Followers", { handle: user.handle, type: "followers" })}
                style={{ alignItems: "center" }}
              >
                <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>
                  {profile?.user.followers ?? 0}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>seguidores</Text>
              </Pressable>
              <Pressable
                onPress={() => user && navigation.navigate("Followers", { handle: user.handle, type: "following" })}
                style={{ alignItems: "center" }}
              >
                <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>
                  {profile?.user.following ?? 0}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>seguindo</Text>
              </Pressable>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>
                  {profile?.progression.unlocked ?? 0}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>conquistas</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>
                  {profile?.user.streak ?? 0}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>sequência</Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 16, marginBottom: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>
              {paradas.length > 1 ? "Minhas paradas" : "Minha parada"}
            </Text>
            <View style={{ flexDirection: "row", gap: 14 }}>
              {paradas.length > 1 && (
                <Pressable onPress={() => user && navigation.navigate("ParadasList", { handle: user.handle })}>
                  <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "700" }}>Ver todas ({paradas.length})</Text>
                </Pressable>
              )}
              <Pressable onPress={() => user && navigation.navigate("History", { handle: user.handle })}>
                <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "700" }}>Histórico</Text>
              </Pressable>
            </View>
          </View>

          {activeChart ? (
            <ParadaChartCard
              chart={activeChart}
              onEditPress={() => navigation.navigate("Editor")}
              onSeeAllPress={() => navigation.navigate("ChartDetail", { chartId: activeChart.id })}
              onPressEntry={(songId, spotifyId) => navigation.navigate("MusicDetail", { songId, spotifyId: spotifyId ?? undefined })}
              onPressArtist={(artistId) => navigation.navigate("ArtistDetail", { artistId })}
            />
          ) : (
            <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 20, alignItems: "center" }}>
              <Text style={{ color: colors.textMuted, fontSize: 13.5 }}>Você ainda não publicou uma parada.</Text>
            </View>
          )}

          {profile?.statsSummary && (
            <View
              style={{
                marginHorizontal: 16,
                marginTop: 12,
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

          {showGamification && profile && (
            <>
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
            </>
          )}
        </>
      )}
      <AchievementDetailModal family={selectedFamily} onClose={() => setSelectedFamily(null)} />
    </Screen>
  );
}
