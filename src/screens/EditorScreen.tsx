import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import Svg, { Path } from "react-native-svg";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { useAuth } from "../state/AuthContext";
import { SongRow } from "../components/SongRow";
import { PillButton } from "../components/PillButton";
import { ChartSong } from "../data/mock";
import { RootStackParamList } from "../navigation/RootNavigator";
import {
  usePublishChartMutation,
  useUpdateChartMutation,
  existingChartIdFromConflict,
  publishErrorMessage,
} from "../api/charts";
import { useHomeHubQuery } from "../api/homeHub";
import { useProfileQuery, ProfileChartEntry } from "../api/profile";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function entryToChartSong(e: ProfileChartEntry, seed: number): ChartSong {
  return {
    t: e.song.title,
    a: e.song.artist,
    cover: { palette: ["#1D1D1F", "#5B5B60"], seed, imageUrl: e.song.imageUrl ?? undefined },
    songId: e.song.id,
    spotifyId: e.song.spotifyId ?? null,
  };
}

export function EditorScreen() {
  const { colors } = useAppTheme();
  const { chart, setChart, removeSong } = useAppState();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const publishMutation = usePublishChartMutation();
  const updateMutation = useUpdateChartMutation();
  const homeHubQuery = useHomeHubQuery(Boolean(user));
  const profileQuery = useProfileQuery(user?.handle);
  const latestChart = profileQuery.data?.user.charts[0];
  const prefilledRef = useRef(false);

  // Reseta a flag de pre-fill sempre que a tela ganha foco, para que abrir o
  // editor de novo (ex.: via "Atualizar meu Chart") ressincronize com o que
  // está publicado no servidor em vez de reaproveitar o estado da visita
  // anterior indefinidamente.
  useFocusEffect(
    React.useCallback(() => {
      if (chart.length === 0) prefilledRef.current = false;
    }, [chart.length])
  );

  useEffect(() => {
    if (prefilledRef.current) return;
    if (chart.length > 0) {
      prefilledRef.current = true;
      return;
    }
    if (latestChart) {
      prefilledRef.current = true;
      setChart(latestChart.entries.map(entryToChartSong));
    }
  }, [latestChart, chart.length, setChart]);

  const isSaving = publishMutation.isPending || updateMutation.isPending;
  const isLoadingChart = profileQuery.isLoading && chart.length === 0;

  const handlePublish = () => {
    if (isSaving) return;
    publishMutation.mutate(chart, {
      onSuccess: () => {
        setChart([]);
        prefilledRef.current = false;
        navigation.navigate("Main");
      },
      onError: (error) => {
        const existingId = existingChartIdFromConflict(error);
        if (existingId) {
          updateMutation.mutate(
            { id: existingId, songs: chart },
            {
              onSuccess: () => {
                setChart([]);
                prefilledRef.current = false;
                navigation.navigate("Main");
              },
              onError: (updateError) => Alert.alert("Não foi possível publicar", publishErrorMessage(updateError)),
            }
          );
          return;
        }
        Alert.alert("Não foi possível publicar", publishErrorMessage(error));
      },
    });
  };

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<ChartSong>) => {
    const index = getIndex() ?? 0;
    return (
      <ScaleDecorator>
        <SongRow
          song={item}
          position={index + 1}
          style={{ backgroundColor: isActive ? colors.surfaceElevated : colors.surface }}
          accessory={
            <>
              <Pressable onPress={() => removeSong(index)} style={{ width: 30, height: 30, alignItems: "center", justifyContent: "center" }}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textDisabled} strokeWidth={2} strokeLinecap="round">
                  <Path d="M18 6 6 18M6 6l12 12" />
                </Svg>
              </Pressable>
              <Pressable onLongPress={drag} delayLongPress={80} style={{ width: 34, height: 38, alignItems: "center", justifyContent: "center" }}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={1.9} strokeLinecap="round">
                  <Path d="M4 8h16M4 12h16M4 16h16" />
                </Svg>
              </Pressable>
            </>
          }
        />
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
          >
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round">
              <Path d="M18 6 6 18M6 6l12 12" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>
              {homeHubQuery.data?.weekStatus.paradaNome ?? "Minha parada"}
            </Text>
            <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 1 }}>
              {latestChart?.weekLabel ?? "Carregando…"} · {chart.length} {chart.length === 1 ? "música" : "músicas"}
            </Text>
          </View>
        </View>

        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 12,
            backgroundColor: colors.accentTint,
            borderWidth: 1,
            borderColor: colors.divider,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Text style={{ fontSize: 12.5, color: colors.textSubtle, lineHeight: 18 }}>
            Segure o punho <Text style={{ fontWeight: "700" }}>≡</Text> e arraste para mudar as posições. Toque no × para
            remover.
          </Text>
        </View>

        {isLoadingChart ? (
          <ActivityIndicator color={colors.text} style={{ marginTop: 30 }} />
        ) : (
          <DraggableFlatList
            data={chart}
            keyExtractor={(item) => item.t}
            renderItem={renderItem}
            onDragEnd={({ data }) => setChart(data)}
            containerStyle={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}
            contentContainerStyle={{ paddingBottom: 96 }}
            ListFooterComponent={
              <Pressable
                onPress={() => navigation.navigate("AddSong")}
                style={{ paddingVertical: 15, alignItems: "center", borderTopWidth: 1, borderTopColor: colors.dividerStrong, borderStyle: "dashed" }}
              >
                <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 14 }}>+ Adicionar música</Text>
              </Pressable>
            }
          />
        )}

        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: colors.bgTopbar, borderTopWidth: 0.5, borderTopColor: colors.divider }}>
          <PillButton label="Publicar parada" onPress={handlePublish} loading={isSaving} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
