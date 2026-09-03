import React from "react";
import { View, Text, Pressable, ActivityIndicator, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useBlockedUsersQuery, useBlockMutation, BlockedUser } from "../api/profile";
import { resolveMediaUrl } from "../lib/api";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function Row({ user }: { user: BlockedUser }) {
  const { colors } = useAppTheme();
  const blockMutation = useBlockMutation();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 16 }}>
      {user.image ? (
        <Image source={{ uri: resolveMediaUrl(user.image) }} style={{ width: 40, height: 40, borderRadius: 20 }} />
      ) : (
        <LinearGradient colors={["#8BC34A", "#CDDC39"]} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>{user.name.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }} numberOfLines={1}>{user.name}</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted }} numberOfLines={1}>@{user.handle}</Text>
      </View>
      <Pressable
        disabled={blockMutation.isPending}
        onPress={() => blockMutation.mutate(user.id)}
        style={{ backgroundColor: colors.fillSubtle, borderRadius: 100, paddingVertical: 8, paddingHorizontal: 16 }}
      >
        <Text style={{ fontSize: 12.5, fontWeight: "700", color: colors.text }}>Desbloquear</Text>
      </Pressable>
    </View>
  );
}

export function BlockedUsersScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const blockedQuery = useBlockedUsersQuery();
  const users = blockedQuery.data?.users ?? [];

  return (
    <Screen>
      <BackHeader title="Contas bloqueadas" />
      {blockedQuery.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : users.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>
          Você não bloqueou ninguém.
        </Text>
      ) : (
        users.map((u) => <Row key={u.id} user={u} />)
      )}
    </Screen>
  );
}
