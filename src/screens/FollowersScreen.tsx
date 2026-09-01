import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Image, FlatList, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useAppTheme } from "../theme/ThemeProvider";
import { useProfileFollowersQuery, useFollowMutation, ProfileFollowUser } from "../api/profile";
import { resolveMediaUrl } from "../lib/api";
import { RootStackParamList } from "../navigation/RootNavigator";

type Route = RouteProp<RootStackParamList, "Followers">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

function Row({ user, navigation }: { user: ProfileFollowUser; navigation: Nav }) {
  const { colors } = useAppTheme();
  const followMutation = useFollowMutation();
  const [following, setFollowing] = useState(user.isFollowing);

  return (
    <Pressable
      onPress={() => navigation.push("UserDetail", { handle: user.handle })}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}
    >
      {user.image ? (
        <Image source={{ uri: resolveMediaUrl(user.image) }} style={{ width: 46, height: 46, borderRadius: 23 }} />
      ) : (
        <LinearGradient colors={["#8BC34A", "#CDDC39"]} style={{ width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>{user.name.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 14.5, fontWeight: "700", color: colors.text }}>
          {user.name}
        </Text>
        <Text numberOfLines={1} style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 1 }}>
          @{user.handle}
        </Text>
      </View>
      <Pressable
        disabled={followMutation.isPending}
        onPress={() => {
          setFollowing((f) => !f);
          followMutation.mutate(user.id, {
            onError: () => {
              setFollowing((f) => !f);
              Alert.alert("Não foi possível seguir", "Tente novamente.");
            },
          });
        }}
        style={{
          backgroundColor: following ? colors.fillSubtle : colors.accent,
          borderRadius: 100,
          paddingVertical: 8,
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ color: following ? colors.text : "#fff", fontWeight: "700", fontSize: 12.5 }}>
          {following ? "Seguindo" : "Seguir"}
        </Text>
      </Pressable>
    </Pressable>
  );
}

export function FollowersScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const handle = route.params?.handle;
  const [tab, setTab] = useState<"followers" | "following">(route.params?.type ?? "followers");
  const query = useProfileFollowersQuery(handle, tab);

  return (
    <Screen scroll={false}>
      <BackHeader title="Seguidores" />
      <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 8 }}>
        {(["followers", "following"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 10,
              borderRadius: 100,
              backgroundColor: tab === t ? colors.accent : colors.fillSubtle,
            }}
          >
            <Text style={{ color: tab === t ? "#fff" : colors.text, fontWeight: "700", fontSize: 13 }}>
              {t === "followers" ? "Seguidores" : "Seguindo"}
            </Text>
          </Pressable>
        ))}
      </View>
      {query.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : (query.data?.users.length ?? 0) === 0 ? (
        <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 40 }}>
          {tab === "followers" ? "Ninguém segue esse perfil ainda." : "Não está seguindo ninguém ainda."}
        </Text>
      ) : (
        <FlatList
          data={query.data!.users}
          keyExtractor={(u) => u.id}
          renderItem={({ item }) => <Row user={item} navigation={navigation} />}
        />
      )}
    </Screen>
  );
}
