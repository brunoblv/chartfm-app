import React from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Image } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { useAuth } from "../state/AuthContext";
import { Screen } from "../components/Screen";
import { MovementBadge, MovementStatus } from "../components/MovementBadge";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useProfileQuery, familyLabel, ProfileFamilyProgress } from "../api/profile";
import { resolveMediaUrl } from "../lib/api";
import { AchievementDetailModal } from "../components/AchievementDetailModal";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const { colors } = useAppTheme();
  const { showGamification } = useAppState();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const profileQuery = useProfileQuery(user?.handle);
  const profile = profileQuery.data;
  const latestChart = profile?.user.charts[0];
  const [selectedFamily, setSelectedFamily] = React.useState<ProfileFamilyProgress | null>(null);

  return (
    <Screen>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 16, paddingBottom: 4, gap: 6 }}>
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
          <View style={{ alignItems: "center", paddingHorizontal: 20, paddingBottom: 20 }}>
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
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 26, marginTop: 18 }}>
              {[
                [String(profile?.totalCharts ?? 0), "paradas"],
                [String(profile?.progression.unlocked ?? 0), "conquistas"],
                [String(profile?.user.streak ?? 0), "sequência"],
              ].map(([n, l]) => (
                <View key={l} style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{n}</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>{l}</Text>
                </View>
              ))}
            </View>
          </View>

          {latestChart ? (
            <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
              <Pressable
                onPress={() => navigation.navigate("ChartDetail", { chartId: latestChart.id })}
                style={{ flexDirection: "row", alignItems: "baseline", gap: 8, padding: 14, paddingBottom: 10 }}
              >
                <Text style={{ flex: 1, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted }}>
                  {latestChart.weekLabel}
                </Text>
                <Pressable onPress={() => navigation.navigate("Editor")}>
                  <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "700" }}>Editar</Text>
                </Pressable>
              </Pressable>
              {latestChart.entries.slice(0, 10).map((e, i) => (
                <View
                  key={`${e.position}-${e.song.title}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingVertical: 9,
                    paddingHorizontal: 14,
                    borderBottomWidth: i === Math.min(latestChart.entries.length, 10) - 1 ? 0 : 1,
                    borderBottomColor: colors.dividerSoft,
                  }}
                >
                  <Text style={{ width: 20, fontSize: 13, fontWeight: "800", color: colors.textMuted }}>{e.position}</Text>
                  {e.song.imageUrl ? (
                    <Image source={{ uri: resolveMediaUrl(e.song.imageUrl) }} style={{ width: 36, height: 36, borderRadius: 8 }} />
                  ) : (
                    <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.fillSubtle }} />
                  )}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text }}>
                      {e.song.title}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted }}>
                      {e.song.artist}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10.5, color: colors.textDisabled, marginRight: 2 }}>
                    {e.weeks} {e.weeks === 1 ? "sem" : "sems"} · pico #{e.peak}
                  </Text>
                  <MovementBadge status={e.status as MovementStatus} delta={e.delta ?? undefined} compact />
                </View>
              ))}
              {latestChart.entries.length > 10 && (
                <Pressable
                  onPress={() => navigation.navigate("UserDetail", { handle: user!.handle })}
                  style={{ paddingVertical: 13, alignItems: "center", borderTopWidth: 1, borderTopColor: colors.dividerSoft }}
                >
                  <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 13 }}>
                    Ver todas as {latestChart.entries.length} músicas
                  </Text>
                </Pressable>
              )}
            </View>
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
