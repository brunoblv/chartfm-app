import React from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../../theme/ThemeProvider";
import { HomeReview } from "../../api/homeHub";
import { resolveMediaUrl } from "../../lib/api";
import { ScoreSquare } from "../ScoreSquare";
import { RootStackParamList } from "../../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ReviewsRow({ reviews }: { reviews: HomeReview[] }) {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  if (reviews.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
      {reviews.map((r) => (
        <Pressable
          key={r.id}
          onPress={() => navigation.navigate("AlbumDetail", { albumId: r.albumId })}
          style={{
            width: 240,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.divider,
            borderRadius: 16,
            padding: 14,
          }}
        >
          <View style={{ flexDirection: "row", gap: 10 }}>
            {r.albumCover ? (
              <Image source={{ uri: resolveMediaUrl(r.albumCover) }} style={{ width: 44, height: 44, borderRadius: 8 }} />
            ) : (
              <View style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: colors.fillSubtle }} />
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                {r.albumTitle}
              </Text>
              <Text numberOfLines={1} style={{ fontSize: 11, color: colors.textMuted }}>
                {r.artistName}
              </Text>
              <View style={{ marginTop: 4 }}>
                <ScoreSquare score={r.rating} size={26} />
              </View>
            </View>
          </View>
          <Text numberOfLines={4} style={{ fontSize: 12, lineHeight: 17, color: colors.textSubtle, marginTop: 10 }}>
            {r.body}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 }}>
            {r.authorImage ? (
              <Image source={{ uri: resolveMediaUrl(r.authorImage) }} style={{ width: 18, height: 18, borderRadius: 9 }} />
            ) : (
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: r.authorColor }} />
            )}
            <Text numberOfLines={1} style={{ fontSize: 11, color: colors.textMuted, flex: 1 }}>
              {r.authorName} · {r.helpful} acharam útil
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
