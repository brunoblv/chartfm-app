import React from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { HomeReview } from "../../api/homeHub";
import { resolveMediaUrl } from "../../lib/api";

function StarRating({ rating, color }: { rating: number; color: string }) {
  return (
    <Text style={{ fontSize: 11, color, letterSpacing: 1 }}>
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
    </Text>
  );
}

export function ReviewsRow({ reviews }: { reviews: HomeReview[] }) {
  const { colors } = useAppTheme();
  if (reviews.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
      {reviews.map((r) => (
        <View
          key={r.id}
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
              <StarRating rating={r.rating} color={colors.accent} />
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
        </View>
      ))}
    </ScrollView>
  );
}
