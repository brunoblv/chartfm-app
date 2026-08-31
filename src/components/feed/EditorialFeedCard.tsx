import React from "react";
import { View, Text, Image } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { FeedEditorialItem } from "../../api/feed";
import { resolveMediaUrl } from "../../lib/api";

export function EditorialFeedCard({ item }: { item: FeedEditorialItem }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ marginHorizontal: 16, marginBottom: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
      {item.previewImage && (
        <Image source={{ uri: resolveMediaUrl(item.previewImage) }} style={{ width: "100%", height: 150 }} />
      )}
      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: 10.5, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.accent }}>
          {item.category}
        </Text>
        <Text numberOfLines={2} style={{ fontSize: 15.5, fontWeight: "800", color: colors.text, marginTop: 4 }}>
          {item.title}
        </Text>
        <Text numberOfLines={2} style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 4, lineHeight: 18 }}>
          {item.excerpt}
        </Text>
        <Text style={{ fontSize: 11, color: colors.textDisabled, marginTop: 8 }}>
          {item.author} · {item.likes} curtidas · {item.comments} comentários
        </Text>
      </View>
    </View>
  );
}
