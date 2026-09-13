import React from "react";
import { View, Text, ScrollView, Image, Pressable, Linking } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { HomeClipRelease } from "../../api/homeHub";
import { resolveMediaUrl } from "../../lib/api";

export function ClipReleasesRow({ clips }: { clips: HomeClipRelease[] }) {
  const { colors } = useAppTheme();
  if (clips.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
      {clips.map((c) => (
        <Pressable key={c.id} onPress={() => Linking.openURL(c.href)} style={{ width: 132 }}>
          {c.coverUrl ? (
            <Image source={{ uri: resolveMediaUrl(c.coverUrl) }} style={{ width: 132, height: 132, borderRadius: 14 }} />
          ) : (
            <View style={{ width: 132, height: 132, borderRadius: 14, backgroundColor: colors.fillSubtle }} />
          )}
          <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text, marginTop: 8 }}>
            {c.title}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted }}>
            {c.artist}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
