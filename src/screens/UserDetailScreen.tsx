import React from "react";
import { View, Text, Pressable, ActivityIndicator, Image, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useAppTheme } from "../theme/ThemeProvider";
import { SongRow } from "../components/SongRow";
import { OTHER_USER } from "../data/mock";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useProfileQuery, useFollowMutation } from "../api/profile";
import { resolveMediaUrl } from "../lib/api";

type Route = RouteProp<RootStackParamList, "UserDetail">;

export function UserDetailScreen() {
  const { colors } = useAppTheme();
  const route = useRoute<Route>();
  const handle = route.params?.handle;
  const profileQuery = useProfileQuery(handle);
  const followMutation = useFollowMutation();
  const profile = profileQuery.data;

  if (!handle) {
    return (
      <Screen>
        <BackHeader />
        <View style={{ alignItems: "center", paddingHorizontal: 20, paddingBottom: 20 }}>
          <LinearGradient colors={OTHER_USER.avatar} style={{ width: 82, height: 82, borderRadius: 41, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 32 }}>{OTHER_USER.initial}</Text>
          </LinearGradient>
          <Text style={{ fontSize: 22, fontWeight: "800", letterSpacing: -0.6, color: colors.text, marginTop: 14 }}>{OTHER_USER.name}</Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 1 }}>{OTHER_USER.handle}</Text>
          <Text style={{ fontSize: 11.5, color: colors.textDisabled, marginTop: 10, textAlign: "center", paddingHorizontal: 30 }}>
            Perfil de exemplo — esta lista ainda não passa o usuário real (ver BACKEND_API.md).
          </Text>
        </View>
        <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
          <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted, padding: 14, paddingBottom: 10 }}>
            Top 20
          </Text>
          {OTHER_USER.top.map((s, i) => (
            <SongRow key={s.t} song={s} position={s.p} last={i === OTHER_USER.top.length - 1} />
          ))}
        </View>
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

  const latestChart = profile.user.charts[0];

  return (
    <Screen>
      <BackHeader />

      <View style={{ alignItems: "center", paddingHorizontal: 20, paddingBottom: 20 }}>
        {profile.imageUrl ? (
          <Image source={{ uri: resolveMediaUrl(profile.imageUrl) }} style={{ width: 82, height: 82, borderRadius: 41 }} />
        ) : (
          <LinearGradient colors={["#8BC34A", "#CDDC39"]} style={{ width: 82, height: 82, borderRadius: 41, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 32 }}>{profile.user.name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
        )}
        <Text style={{ fontSize: 22, fontWeight: "800", letterSpacing: -0.6, color: colors.text, marginTop: 14 }}>{profile.user.name}</Text>
        <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 1 }}>@{profile.user.handle}</Text>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 26, marginTop: 18 }}>
          {[
            [String(profile.totalCharts), "paradas"],
            [String(profile.user.followers), "seguidores"],
            [String(profile.user.streak), "sequência"],
          ].map(([n, l]) => (
            <View key={l} style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{n}</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>{l}</Text>
            </View>
          ))}
        </View>
        <Pressable
          disabled={followMutation.isPending}
          onPress={() =>
            followMutation.mutate(profile.user.id, {
              onError: () => Alert.alert("Não foi possível seguir", "Tente novamente."),
            })
          }
          style={{
            marginTop: 18,
            backgroundColor: profile.isFollowing ? colors.fillSubtle : colors.accent,
            borderRadius: 100,
            paddingVertical: 12,
            paddingHorizontal: 34,
          }}
        >
          <Text style={{ color: profile.isFollowing ? colors.text : "#fff", fontWeight: "700", fontSize: 14.5 }}>
            {profile.isFollowing ? "Seguindo" : "Seguir"}
          </Text>
        </Pressable>
      </View>

      {latestChart ? (
        <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
          <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted, padding: 14, paddingBottom: 10 }}>
            {latestChart.weekLabel}
          </Text>
          {latestChart.entries.slice(0, 20).map((e, i) => (
            <View
              key={`${e.position}-${e.song.title}`}
              style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, paddingHorizontal: 14, borderBottomWidth: i === Math.min(latestChart.entries.length, 20) - 1 ? 0 : 1, borderBottomColor: colors.dividerSoft }}
            >
              <Text style={{ width: 20, fontSize: 13, fontWeight: "800", color: colors.textMuted }}>{e.position}</Text>
              {e.song.imageUrl ? (
                <Image source={{ uri: resolveMediaUrl(e.song.imageUrl) }} style={{ width: 36, height: 36, borderRadius: 8 }} />
              ) : (
                <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.fillSubtle }} />
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text }}>{e.song.title}</Text>
                <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted }}>{e.song.artist}</Text>
              </View>
              <Text style={{ fontSize: 10.5, color: colors.textDisabled }}>
                {e.weeks} {e.weeks === 1 ? "sem" : "sems"} · pico #{e.peak}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 20 }}>Sem parada publicada.</Text>
      )}
    </Screen>
  );
}
