import React from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { HomeReleaseAlbum } from "../../api/homeHub";
import { resolveMediaUrl } from "../../lib/api";

export function ReleasesRow({ albums }: { albums: HomeReleaseAlbum[] }) {
  const { colors } = useAppTheme();
  if (albums.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
      {albums.map((a) => (
        <View key={a.albumId} style={{ width: 132 }}>
          {a.coverUrl ? (
            <Image source={{ uri: resolveMediaUrl(a.coverUrl) }} style={{ width: 132, height: 132, borderRadius: 14 }} />
          ) : (
            <View style={{ width: 132, height: 132, borderRadius: 14, backgroundColor: colors.fillSubtle }} />
          )}
          <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text, marginTop: 8 }}>
            {a.title}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted }}>
            {a.artist}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
