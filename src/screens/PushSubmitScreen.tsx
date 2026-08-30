import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator, Image, Alert } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { useSearchQuery } from "../api/search";
import { usePushRoundQuery, usePushSubmitMutation, pushErrorMessage, pushPhaseLabel } from "../api/push";

export function PushSubmitScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const roundQuery = usePushRoundQuery();
  const round = roundQuery.data?.round;
  const submitMutation = usePushSubmitMutation(round?.id);
  const [query, setQuery] = useState("");
  const { data, isLoading } = useSearchQuery(query);
  const results = (data?.songs ?? []).filter((s) => s.spotifyId);

  const handleSubmit = (spotifyId: string) => {
    if (submitMutation.isPending) return;
    submitMutation.mutate(spotifyId, {
      onSuccess: () => {
        Alert.alert("Indicação enviada", "Sua música foi enviada para esta rodada do Push.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      },
      onError: (error) => Alert.alert("Não foi possível enviar", pushErrorMessage(error)),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Indicar música — Push" />

      {roundQuery.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : !round ? (
        <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 40 }}>Nenhuma rodada ativa.</Text>
      ) : round.phase !== "SUBMISSION" ? (
        <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 40, paddingHorizontal: 30 }}>
          {round.title} está em "{pushPhaseLabel(round.phase)}" — indicações só são aceitas no período de inscrição.
        </Text>
      ) : (
        <>
          <Text style={{ paddingHorizontal: 20, fontSize: 13, color: colors.textMuted, marginBottom: 10 }}>
            {round.title} · lançada nos últimos 12 meses
          </Text>
          <View style={{ marginHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.fillSubtle, borderRadius: 12, padding: 13, marginBottom: 12 }}>
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
          <ScrollView>
            {isLoading ? (
              <ActivityIndicator color={colors.text} style={{ marginTop: 10 }} />
            ) : (
              <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
                {results.map((song, i) => (
                  <Pressable
                    key={song.id}
                    onPress={() => handleSubmit(song.spotifyId!)}
                    disabled={submitMutation.isPending}
                    style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: i === results.length - 1 ? 0 : 1, borderBottomColor: colors.dividerSoft }}
                  >
                    {song.coverUrl ? (
                      <Image source={{ uri: song.coverUrl }} style={{ width: 44, height: 44, borderRadius: 10 }} />
                    ) : (
                      <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: colors.fillSubtle }} />
                    )}
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{song.title}</Text>
                      <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>{song.artist}</Text>
                    </View>
                  </Pressable>
                ))}
                {query.trim().length >= 2 && results.length === 0 && (
                  <Text style={{ padding: 16, fontSize: 13, color: colors.textMuted }}>Nenhuma música encontrada.</Text>
                )}
              </View>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}
