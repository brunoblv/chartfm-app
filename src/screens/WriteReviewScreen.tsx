import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Image, Alert, GestureResponderEvent } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { useSearchQuery, SearchAlbum } from "../api/search";
import { useSubmitAlbumReviewMutation, createErrorMessage } from "../api/create";
import { scoreColor } from "../components/ScoreSquare";
import { resolveMediaUrl } from "../lib/api";
import { PillButton } from "../components/PillButton";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "WriteReview">;

const MIN_REVIEW_CHARS = 50;

/** Nota tocável de 0 a 100. Sem `@react-native-community/slider` no projeto, um `View` com o responder nativo basta. */
function RatingBar({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { colors } = useAppTheme();
  const [width, setWidth] = useState(0);

  const setFromX = (x: number) => {
    if (width <= 0) return;
    const pct = Math.round((Math.max(0, Math.min(width, x)) / width) * 100);
    onChange(pct);
  };

  const onTouch = (e: GestureResponderEvent) => setFromX(e.nativeEvent.locationX);

  return (
    <View>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={onTouch}
        onResponderMove={onTouch}
        style={{ height: 34, justifyContent: "center" }}
      >
        <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.fillSubtle, overflow: "hidden" }}>
          <View style={{ width: `${value}%`, height: "100%", backgroundColor: scoreColor(value) }} />
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2 }}>
        <Text style={{ fontSize: 11, color: colors.textMuted }}>0</Text>
        <Text style={{ fontSize: 11, color: colors.textMuted }}>100</Text>
      </View>
    </View>
  );
}

/**
 * Folha "Avaliar um álbum" do botão + do celular. Espelha a 3ª ação de
 * `nav.createSheetTitle` no site: busca o álbum (ou recebe um já escolhido, ao
 * abrir a partir do próprio álbum), dá nota de 0 a 100 e publica via
 * `POST /api/albums/[albumId]/reviews` (mesma régua do site: texto só conta
 * com 50+ caracteres, senão é descartado).
 */
export function WriteReviewScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const preselected = route.params;

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SearchAlbum | null>(
    preselected?.albumId != null
      ? {
          id: preselected.albumId,
          title: preselected.title ?? "",
          artist: preselected.artist ?? "",
          artistId: 0,
          coverUrl: preselected.coverUrl ?? null,
          year: null,
        }
      : null
  );
  const [rating, setRating] = useState(70);
  const [text, setText] = useState("");
  const { data, isLoading } = useSearchQuery(query);
  const results = data?.albums ?? [];
  const mutation = useSubmitAlbumReviewMutation();

  const textTooShort = text.trim().length > 0 && text.trim().length < MIN_REVIEW_CHARS;

  const handleSubmit = () => {
    if (!selected || textTooShort) return;
    mutation.mutate(
      { albumId: selected.id, rating, reviewBody: text.trim() || undefined },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error) => Alert.alert("Não foi possível avaliar", createErrorMessage(error)),
      }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} onPress={() => navigation.goBack()} />
      <View
        style={{
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
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              {!preselected?.albumId && (
                <Pressable onPress={() => setSelected(null)} style={{ width: 30, height: 30, alignItems: "center", justifyContent: "center" }}>
                  <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round">
                    <Path d="M15 18l-6-6 6-6" />
                  </Svg>
                </Pressable>
              )}
              <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>
                Avaliar álbum
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

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", letterSpacing: 0.4, textTransform: "uppercase", color: colors.textMuted }}>
                Sua nota
              </Text>
              <Text style={{ fontSize: 22, fontWeight: "800", color: scoreColor(rating) }}>{rating}</Text>
            </View>
            <RatingBar value={rating} onChange={setRating} />

            <Text style={{ fontSize: 12, fontWeight: "700", letterSpacing: 0.4, textTransform: "uppercase", color: colors.textMuted, marginTop: 22, marginBottom: 8 }}>
              Review (opcional, mín. {MIN_REVIEW_CHARS} caracteres)
            </Text>
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              placeholder="O que você achou desse álbum?"
              placeholderTextColor={colors.textMuted}
              style={{
                minHeight: 110,
                backgroundColor: colors.fillSubtle,
                borderRadius: 14,
                padding: 13,
                fontSize: 14,
                color: colors.text,
                textAlignVertical: "top",
              }}
            />
            {textTooShort && (
              <Text style={{ fontSize: 12, color: colors.downFg, marginTop: 6 }}>
                Faltam {MIN_REVIEW_CHARS - text.trim().length} caracteres, ou apague tudo para avaliar só com a nota.
              </Text>
            )}

            <PillButton
              label="Publicar avaliação"
              onPress={handleSubmit}
              loading={mutation.isPending}
              disabled={textTooShort}
              style={{ marginTop: 20 }}
            />
          </ScrollView>
        ) : (
          <>
            <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>
                Avaliar álbum
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
                  placeholder="buscar álbum ou artista"
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
                  {results.map((album, i) => (
                    <Pressable
                      key={album.id}
                      onPress={() => setSelected(album)}
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
                      {album.coverUrl ? (
                        <Image source={{ uri: resolveMediaUrl(album.coverUrl) }} style={{ width: 44, height: 44, borderRadius: 10 }} />
                      ) : (
                        <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: colors.fillSubtle }} />
                      )}
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                          {album.title}
                        </Text>
                        <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
                          {album.artist}
                          {album.year ? ` · ${album.year}` : ""}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                  {results.length === 0 && (
                    <Text style={{ padding: 16, fontSize: 13, color: colors.textMuted }}>Nenhum álbum encontrado.</Text>
                  )}
                </View>
              )}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
}
