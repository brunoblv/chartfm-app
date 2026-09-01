import React from "react";
import { View, Text, Pressable, ActivityIndicator, Image, Alert, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useProfileQuery, useFollowMutation, useUserParadasQuery } from "../api/profile";
import { useStartConversationMutation } from "../api/conversas";
import { resolveMediaUrl } from "../lib/api";
import { ParadaChartCard } from "../components/ParadaChartCard";

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

        {(profile.lastfmUser || profile.twitterUser || profile.instagramUser) && (
          <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
            {profile.lastfmUser && (
              <Pressable onPress={() => Linking.openURL(`https://www.last.fm/user/${profile.lastfmUser}`)}>
                <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "600" }}>Last.fm</Text>
              </Pressable>
            )}
            {profile.twitterUser && (
              <Pressable onPress={() => Linking.openURL(`https://x.com/${profile.twitterUser}`)}>
                <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "600" }}>X</Text>
              </Pressable>
            )}
            {profile.instagramUser && (
              <Pressable onPress={() => Linking.openURL(`https://instagram.com/${profile.instagramUser}`)}>
                <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "600" }}>Instagram</Text>
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
            <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{profile.totalCharts}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>paradas</Text>
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
        />
      ) : (
        <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 20 }}>Sem parada publicada.</Text>
      )}
    </Screen>
  );
}
