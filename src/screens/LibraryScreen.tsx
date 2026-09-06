import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useAppTheme } from "../theme/ThemeProvider";
import { resolveMediaUrl } from "../lib/api";
import {
  LIBRARY_FILTER_LABELS,
  LIBRARY_TYPE_LABELS,
  LibraryEntry,
  LibraryFilter,
  librarySourceLabel,
  useLibraryQuery,
} from "../api/library";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FILTERS: LibraryFilter[] = ["tudo", "song", "album", "artist", "chart", "review"];

function formatSavedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function openEntry(entry: LibraryEntry, navigation: Nav) {
  if (entry.itemType === "song") {
    navigation.navigate("MusicDetail", { songId: entry.itemId });
    return;
  }
  if (entry.itemType === "album") {
    const albumId = Number(entry.itemId);
    if (Number.isInteger(albumId) && albumId > 0) navigation.navigate("AlbumDetail", { albumId });
    return;
  }
  if (entry.itemType === "artist") {
    const artistId = Number(entry.itemId);
    if (Number.isInteger(artistId) && artistId > 0) navigation.navigate("ArtistDetail", { artistId });
    return;
  }
  if (entry.itemType === "chart") {
    navigation.navigate("ChartDetail", { chartId: entry.itemId });
    return;
  }
  if (entry.itemType === "review" && entry.albumId) {
    navigation.navigate("AlbumDetail", { albumId: entry.albumId });
  }
}

export function LibraryScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<LibraryFilter>("tudo");
  const query = useLibraryQuery(filter);
  const data = query.data;
  const entries = data?.entries ?? [];

  return (
    <Screen scroll={false}>
      <BackHeader title="Biblioteca" />

      <Text style={{ fontSize: 13.5, lineHeight: 20, color: colors.textMuted, paddingHorizontal: 16, paddingBottom: 12 }}>
        O que você encontrou no ChartFM e quis guardar. Não substitui o Spotify nem o Apple Music: serve para lembrar do
        que apareceu por aqui.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
      >
        {FILTERS.map((f) => {
          const count = data?.counts[f];
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 100,
                backgroundColor: filter === f ? colors.accent : colors.fillSubtle,
              }}
            >
              <Text style={{ color: filter === f ? "#fff" : colors.text, fontWeight: "700", fontSize: 12.5 }}>
                {LIBRARY_FILTER_LABELS[f]}
                {count != null ? ` (${count})` : ""}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {query.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 30 }} />
      ) : entries.length === 0 ? (
        <View style={{ paddingHorizontal: 24, marginTop: 36, alignItems: "center" }}>
          <Text style={{ fontSize: 14.5, lineHeight: 21, color: colors.textMuted, textAlign: "center" }}>
            Sua biblioteca está vazia. O botão de salvar aparece nas páginas de música, álbum, artista, parada e
            avaliação.
          </Text>
          <Pressable
            onPress={() => navigation.navigate("Main", { screen: "Discover" } as never)}
            style={{ marginTop: 16, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, backgroundColor: colors.accent }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13.5 }}>Descobrir alguma coisa</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {data && data.withSource > 0 ? (
            <Text style={{ fontSize: 12.5, lineHeight: 18, color: colors.textMuted, paddingHorizontal: 16, paddingBottom: 10 }}>
              {data.fromPeople} dos {data.withSource} itens com origem registrada chegaram até você através de outra
              pessoa.
            </Text>
          ) : null}
          {entries.map((entry) => {
            const where = librarySourceLabel(entry.source);
            const through = entry.sourceUser?.name;
            return (
              <Pressable
                key={entry.id}
                onPress={() => openEntry(entry, navigation)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.dividerSoft,
                }}
              >
                {entry.coverUrl ? (
                  <Image source={{ uri: resolveMediaUrl(entry.coverUrl) }} style={{ width: 52, height: 52, borderRadius: 10 }} />
                ) : (
                  <View style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: colors.fillSubtle }} />
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted, marginBottom: 2 }}>
                    {LIBRARY_TYPE_LABELS[entry.itemType]}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 14.5, fontWeight: "700", color: colors.text }}>
                    {entry.title}
                  </Text>
                  {entry.subtitle ? (
                    <Text numberOfLines={1} style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>
                      {entry.subtitle}
                    </Text>
                  ) : null}
                  <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textSubtle, marginTop: 4 }}>
                    Salvo em {formatSavedAt(entry.savedAt)}
                    {through ? ` · através de ${through}` : where ? ` · em ${where}` : ""}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}
