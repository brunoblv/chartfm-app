import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Image, Alert } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { useSearchQuery, SearchSong } from "../api/search";
import { useCreateRecommendationMutation, createErrorMessage } from "../api/create";
import { resolveMediaUrl } from "../lib/api";
import { PillButton } from "../components/PillButton";
import { SheetScaffold } from "../components/SheetScaffold";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Folha "Recomendar uma música" do botão + do celular. Espelha a 2ª ação de
 * `nav.createSheetTitle` no site (`components/layout/BottomNav.tsx`): busca a
 * música, escreve um comentário opcional e publica via `POST /api/recommendations`.
 */
export function RecommendSongScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SearchSong | null>(null);
  const [text, setText] = useState("");
  const { data, isLoading } = useSearchQuery(query);
  const results = data?.songs ?? [];
  const mutation = useCreateRecommendationMutation();

  const handleSubmit = () => {
    if (!selected) return;
    mutation.mutate(
      {
        songId: selected.id,
        spotifyId: selected.spotifyId ?? undefined,
        title: selected.title,
        artist: selected.artist,
        album: selected.album ?? undefined,
        text: text.trim() || undefined,
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error) => Alert.alert("Não foi possível recomendar", createErrorMessage(error)),
      }
    );
  };

  return (
    <SheetScaffold
      onClose={() => navigation.goBack()}
      sheetStyle={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        top: 64,
        backgroundColor: colors.surfaceElevated,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        borderTopWidth: 0.5,
        borderTopColor: colors.divider,
      }}
    >
        <View style={{ alignItems: "center", paddingVertical: 10 }}>
          <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: colors.dividerStrong }} />
        </View>

        {selected ? (
          <View style={{ flex: 1, paddingHorizontal: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Pressable onPress={() => setSelected(null)} style={{ width: 30, height: 30, alignItems: "center", justifyContent: "center" }}>
                <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round">
                  <Path d="M15 18l-6-6 6-6" />
                </Svg>
              </Pressable>
              <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>
                Recomendar música
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.fillSubtle, borderRadius: 14, padding: 12 }}>
              {selected.coverUrl ? (
                <Image source={{ uri: resolveMediaUrl(selected.coverUrl) }} style={{ width: 52, height: 52, borderRadius: 10 }} />
              ) : (
                <View style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: colors.fillInset }} />
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
                  {selected.title}
                </Text>
                <Text numberOfLines={1} style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                  {selected.artist}
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 12, fontWeight: "700", letterSpacing: 0.4, textTransform: "uppercase", color: colors.textMuted, marginTop: 20, marginBottom: 8 }}>
              Por que essa música? (opcional)
            </Text>
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              maxLength={1000}
              placeholder="Escreva um comentário para quem for ouvir…"
              placeholderTextColor={colors.textMuted}
              style={{
                minHeight: 90,
                backgroundColor: colors.fillSubtle,
                borderRadius: 14,
                padding: 13,
                fontSize: 14,
                color: colors.text,
                textAlignVertical: "top",
              }}
            />

            <PillButton
              label="Publicar recomendação"
              onPress={handleSubmit}
              loading={mutation.isPending}
              style={{ marginTop: 20, marginBottom: 12 }}
            />
          </View>
        ) : (
          <>
            <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>
                Recomendar música
              </Text>
              <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.fillSubtle, borderRadius: 12, padding: 13 }}>
                <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2} strokeLinecap="round">
                  <Circle cx={11} cy={11} r={7} />
                  <Path d="M20 20l-3.5-3.5" />
                </Svg>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                  placeholder="buscar música ou artista"
                  placeholderTextColor={colors.textMuted}
                  style={{ flex: 1, fontSize: 14.5, fontWeight: "600", color: colors.text, padding: 0 }}
                />
              </View>
            </View>
            <ScrollView>
              {query.trim().length < 2 ? (
                <Text style={{ paddingHorizontal: 20, fontSize: 13, color: colors.textMuted }}>
                  Digite pelo menos 2 letras para buscar.
                </Text>
              ) : isLoading ? (
                <ActivityIndicator color={colors.text} style={{ marginTop: 20 }} />
              ) : (
                <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
                  {results.map((song, i) => (
                    <Pressable
                      key={song.id}
                      onPress={() => setSelected(song)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        paddingVertical: 11,
                        paddingHorizontal: 14,
                        borderBottomWidth: i === results.length - 1 ? 0 : 1,
                        borderBottomColor: colors.dividerSoft,
                      }}
                    >
                      {song.coverUrl ? (
                        <Image source={{ uri: resolveMediaUrl(song.coverUrl) }} style={{ width: 44, height: 44, borderRadius: 10 }} />
                      ) : (
                        <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: colors.fillSubtle }} />
                      )}
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                          {song.title}
                        </Text>
                        <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
                          {song.artist}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                  {results.length === 0 && (
                    <Text style={{ padding: 16, fontSize: 13, color: colors.textMuted }}>Nenhuma música encontrada.</Text>
                  )}
                </View>
              )}
            </ScrollView>
          </>
        )}
    </SheetScaffold>
  );
}
