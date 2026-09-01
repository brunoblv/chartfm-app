import React, { useState } from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { ScoreSquare } from "../components/ScoreSquare";
import { resolveMediaUrl } from "../lib/api";
import { useToggleReviewHelpfulMutation } from "../api/album";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "ReviewDetail">;

export function ReviewDetailScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const r = route.params.review;
  const helpfulMutation = useToggleReviewHelpfulMutation(r.albumId);
  const [helpful, setHelpful] = useState(r.helpful);
  const [marked, setMarked] = useState(false);

  const handleHelpful = () => {
    setHelpful((h) => (marked ? h - 1 : h + 1));
    setMarked((m) => !m);
    helpfulMutation.mutate(r.id);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackHeader />

      <Pressable
        onPress={() => navigation.navigate("AlbumDetail", { albumId: r.albumId })}
        style={{ flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 14 }}
      >
        {r.albumCover ? (
          <Image source={{ uri: resolveMediaUrl(r.albumCover) }} style={{ width: 56, height: 56, borderRadius: 10 }} />
        ) : (
          <View style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: colors.fillSubtle }} />
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
            {r.albumTitle}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
            {r.artistName}
          </Text>
        </View>
        <ScoreSquare score={r.rating} size={36} />
      </Pressable>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginTop: 18 }}>
        {r.authorImage ? (
          <Image source={{ uri: resolveMediaUrl(r.authorImage) }} style={{ width: 30, height: 30, borderRadius: 15 }} />
        ) : (
          <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: r.authorColor }} />
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
            {r.authorName}
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 15, lineHeight: 22, color: colors.text, marginHorizontal: 16, marginTop: 16 }}>
        {r.body}
      </Text>

      <Pressable
        onPress={handleHelpful}
        style={{ flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 16, marginTop: 16 }}
      >
        <Text style={{ fontSize: 12.5, color: marked ? colors.accent : colors.textMuted, fontWeight: "700" }}>
          👍 {helpful} {helpful === 1 ? "achou útil" : "acharam útil"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
