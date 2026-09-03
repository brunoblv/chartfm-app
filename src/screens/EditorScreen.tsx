import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { TouchableOpacity } from "react-native-gesture-handler";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { useAuth } from "../state/AuthContext";
import { Cover } from "../components/Cover";
import { PillButton } from "../components/PillButton";
import { ChartSong, chartSongKey } from "../data/mock";
import { RootStackParamList } from "../navigation/RootNavigator";
import {
  usePublishChartMutation,
  useUpdateChartMutation,
  existingChartIdFromConflict,
  publishErrorMessage,
} from "../api/charts";
import { useProfileQuery, ProfileChartEntry } from "../api/profile";
import { useParadasQuery } from "../api/paradas";

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
  const insets = useSafeAreaInsets();
  const { chart, setChart, removeSong, moveSong, paradaId, weekDate, spotlights, resetDraft } = useAppState();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const publishMutation = usePublishChartMutation();
  const updateMutation = useUpdateChartMutation();
  const paradasQuery = useParadasQuery();
  const selectedParada =
    paradasQuery.data?.paradas.find((p) => p.id === paradaId) ??
    paradasQuery.data?.paradas.find((p) => p.isPrimary) ??
    paradasQuery.data?.paradas[0];
  const profileQuery = useProfileQuery(user?.handle, paradaId ?? selectedParada?.id);
  const latestChart = profileQuery.data?.user.charts[0];
  const prefilledRef = useRef(false);
  const lastParadaRef = useRef(paradaId);

  useFocusEffect(
    React.useCallback(() => {
      if (chart.length === 0) prefilledRef.current = false;
    }, [chart.length])
  );

  useEffect(() => {
    if (lastParadaRef.current === paradaId) return;
    lastParadaRef.current = paradaId;
    prefilledRef.current = false;
    setChart([]);
  }, [paradaId, setChart]);

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
  const chartSize =
    selectedParada?.chartSize && selectedParada.chartSize > 0 ? selectedParada.chartSize : null;

  const handlePublish = () => {
    if (isSaving) return;
    const songs = chartSize ? chart.slice(0, chartSize) : chart;
    const vars = { songs, paradaId: paradaId ?? selectedParada?.id ?? null, weekDate, spotlights };
    publishMutation.mutate(vars, {
      onSuccess: () => {
        resetDraft();
        prefilledRef.current = false;
        navigation.navigate("Main");
      },
      onError: (error) => {
        const existingId = existingChartIdFromConflict(error);
        if (existingId) {
          updateMutation.mutate(
            { id: existingId, ...vars },
            {
              onSuccess: () => {
                resetDraft();
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

  const spotlightCount = Object.values(spotlights).filter((s) => s != null).length;
  const periodLabel = weekDate
    ? new Date(`${weekDate}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    : null;

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<ChartSong>) => {
    const index = getIndex() ?? 0;
    const beyondCut = chartSize != null && index >= chartSize;
    const showCutBanner = chartSize != null && index === chartSize;
    return (
      <View>
        {showCutBanner ? (
          <View
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              backgroundColor: colors.accentTint,
              borderTopWidth: 1,
              borderTopColor: "rgba(250,36,60,0.2)",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.accent }}>
              Corte da parada · posição {chartSize}
            </Text>
          </View>
        ) : null}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 8,
            paddingLeft: 12,
            paddingRight: 6,
            backgroundColor: isActive ? colors.surfaceElevated : colors.surface,
            opacity: beyondCut ? 0.45 : 1,
            borderBottomWidth: 1,
            borderBottomColor: colors.dividerSoft,
          }}
        >
          <Text style={{ width: 22, fontSize: 15, fontWeight: "800", letterSpacing: -0.4, color: colors.text }}>
            {index + 1}
          </Text>
          <Cover cover={item.cover} size={40} rounded={8} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text }}>
              {item.t}
            </Text>
            <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 1 }}>
              {item.a}
            </Text>
          </View>
          <View style={{ gap: 3 }}>
            <Pressable
              onPress={() => moveSong(index, index - 1)}
              disabled={index === 0}
              hitSlop={4}
              style={{
                width: 30,
                height: 24,
                borderRadius: 7,
                backgroundColor: colors.fillInset,
                alignItems: "center",
                justifyContent: "center",
                opacity: index === 0 ? 0.28 : 1,
              }}
            >
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.4} strokeLinecap="round">
                <Path d="M18 15l-6-6-6 6" />
              </Svg>
            </Pressable>
            <Pressable
              onPress={() => moveSong(index, index + 1)}
              disabled={index >= chart.length - 1}
              hitSlop={4}
              style={{
                width: 30,
                height: 24,
                borderRadius: 7,
                backgroundColor: colors.fillInset,
                alignItems: "center",
                justifyContent: "center",
                opacity: index >= chart.length - 1 ? 0.28 : 1,
              }}
            >
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.4} strokeLinecap="round">
                <Path d="M6 9l6 6 6-6" />
              </Svg>
            </Pressable>
          </View>
          <Pressable
            onPress={() => removeSong(index)}
            hitSlop={6}
            style={{ width: 28, height: 36, alignItems: "center", justifyContent: "center" }}
          >
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={colors.textDisabled} strokeWidth={2} strokeLinecap="round">
              <Path d="M18 6 6 18M6 6l12 12" />
            </Svg>
          </Pressable>
          <TouchableOpacity
            onPressIn={drag}
            style={{ width: 36, height: 44, alignItems: "center", justifyContent: "center" }}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={1.9} strokeLinecap="round">
              <Path d="M4 8h16M4 12h16M4 16h16" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
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
            {selectedParada?.name ?? "Minha parada"}
          </Text>
          <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 1 }}>
            {periodLabel ?? latestChart?.weekLabel ?? "Carregando…"} · {chart.length} {chart.length === 1 ? "música" : "músicas"}
            {chartSize ? ` · ${chartSize} posições` : ""}
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("ParadaWeekPicker")}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
        >
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round">
            <Path d="M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
          </Svg>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Lastfm")}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
        >
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round">
            <Path d="M12 3v12M12 15l-4-4M12 15l4-4M4 19h16" />
          </Svg>
        </Pressable>
      </View>

      <Pressable
        onPress={() => navigation.navigate("AddSong")}
        style={{
          marginHorizontal: 16,
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 9,
          backgroundColor: colors.fillSubtle,
          borderRadius: 12,
          padding: 13,
        }}
      >
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round">
          <Circle cx={11} cy={11} r={7} />
          <Path d="M20 20l-3.5-3.5" />
        </Svg>
        <Text style={{ flex: 1, fontSize: 14.5, fontWeight: "600", color: colors.textMuted }}>
          Buscar no catálogo ou no Spotify
        </Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("Spotlights")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 16,
          marginBottom: 10,
          paddingVertical: 10,
          paddingHorizontal: 12,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.divider,
          borderRadius: 12,
        }}
      >
        <Text style={{ flex: 1, fontSize: 13, fontWeight: "700", color: colors.text }}>
          Destaques {spotlightCount > 0 ? `(${spotlightCount})` : "(opcional)"}
        </Text>
        <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={2.2} strokeLinecap="round">
          <Path d="M9 18l6-6-6-6" />
        </Svg>
      </Pressable>

      {chartSize !== null && chart.length > chartSize ? (
        <Text style={{ marginHorizontal: 16, marginBottom: 8, fontSize: 12, color: colors.textMuted, lineHeight: 17 }}>
          {chart.length - chartSize === 1
            ? "1 música além do tamanho da parada será descartada ao publicar."
            : `${chart.length - chartSize} músicas além do tamanho da parada serão descartadas ao publicar.`}
        </Text>
      ) : (
        <Text style={{ marginHorizontal: 16, marginBottom: 8, fontSize: 12, color: colors.textMuted, lineHeight: 17 }}>
          Use as setas ou arraste o punho para reordenar. O Last.fm só carrega a lista.
        </Text>
      )}

      {isLoadingChart ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 30 }} />
      ) : (
        <DraggableFlatList
          data={chart}
          keyExtractor={(item) => chartSongKey(item)}
          renderItem={renderItem}
          onDragEnd={({ data }) => setChart(data)}
          activationDistance={1}
          autoscrollSpeed={120}
          autoscrollThreshold={60}
          containerStyle={{ flex: 1, marginHorizontal: 16 }}
          style={{ flex: 1 }}
          contentContainerStyle={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.divider,
            borderRadius: 16,
            paddingBottom: 16,
          }}
          ListEmptyComponent={
            <Text style={{ padding: 20, fontSize: 13, color: colors.textMuted, textAlign: "center" }}>
              Busque uma música ou importe do Last.fm para começar.
            </Text>
          }
          ListFooterComponent={
            <Pressable
              onPress={() => navigation.navigate("AddSong")}
              style={{
                paddingVertical: 15,
                alignItems: "center",
                borderTopWidth: 1,
                borderTopColor: colors.dividerStrong,
                borderStyle: "dashed",
              }}
            >
              <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 14 }}>+ Adicionar música</Text>
            </Pressable>
          }
        />
      )}

      <View
        style={{
          padding: 16,
          paddingBottom: 16 + insets.bottom,
          backgroundColor: colors.bgTopbar,
          borderTopWidth: 0.5,
          borderTopColor: colors.divider,
        }}
      >
        <PillButton label="Publicar parada" onPress={handlePublish} loading={isSaving} />
      </View>
    </SafeAreaView>
  );
}
