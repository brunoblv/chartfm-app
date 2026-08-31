import React from "react";
import { View, Text, ScrollView, ActivityIndicator, Image } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { MovementBadge, MovementStatus } from "../components/MovementBadge";
import { ChartSpotlightCard, SpotlightKind } from "../components/ChartSpotlightCard";
import { resolveMediaUrl } from "../lib/api";
import { useChartDetailQuery } from "../api/chartDetail";
import { RootStackParamList } from "../navigation/RootNavigator";

type Route = RouteProp<RootStackParamList, "ChartDetail">;

const SPOTLIGHT_ORDER: SpotlightKind[] = ["flashback", "destaque", "nacional", "push", "radar"];

export function ChartDetailScreen() {
  const { colors } = useAppTheme();
  const route = useRoute<Route>();
  const chartId = route.params?.chartId;
  const detailQuery = useChartDetailQuery(chartId);
  const data = detailQuery.data;

  const spotlights = data
    ? SPOTLIGHT_ORDER.map((kind) => ({ kind, song: data[kind] })).filter(
        (s): s is { kind: SpotlightKind; song: NonNullable<typeof s.song> } => Boolean(s.song)
      )
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={data?.chart.paradaNome ?? "Parada"} />

      {detailQuery.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : !data ? (
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>
          Não foi possível carregar essa parada.
        </Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={{ paddingHorizontal: 16, fontSize: 12.5, color: colors.textMuted }}>
            {data.chart.weekLabel} · {data.chart.entries.length}{" "}
            {data.chart.entries.length === 1 ? "música" : "músicas"}
          </Text>

          {spotlights.length > 0 ? (
            <>
              <Text
                style={{
                  paddingHorizontal: 16,
                  marginTop: 18,
                  marginBottom: 10,
                  fontSize: 15,
                  fontWeight: "800",
                  letterSpacing: -0.3,
                  color: colors.text,
                }}
              >
                Destaques
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
                {spotlights.map(({ kind, song }) => (
                  <ChartSpotlightCard key={kind} kind={kind} song={song} />
                ))}
              </ScrollView>
            </>
          ) : null}

          <View
            style={{
              marginHorizontal: 16,
              marginTop: 18,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.divider,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {data.chart.entries.map((e, i) => (
              <View
                key={`${e.position}-${e.song.title}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 9,
                  paddingHorizontal: 14,
                  borderBottomWidth: i === data.chart.entries.length - 1 ? 0 : 1,
                  borderBottomColor: colors.dividerSoft,
                }}
              >
                <Text style={{ width: 20, fontSize: 13, fontWeight: "800", color: colors.textMuted }}>{e.position}</Text>
                {e.song.imageUrl ? (
                  <Image source={{ uri: resolveMediaUrl(e.song.imageUrl) }} style={{ width: 36, height: 36, borderRadius: 8 }} />
                ) : (
                  <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.fillSubtle }} />
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text }}>
                    {e.song.title}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted }}>
                    {e.song.artist}
                  </Text>
                </View>
                <Text style={{ fontSize: 10.5, color: colors.textDisabled, marginRight: 2 }}>
                  {e.weeks} {e.weeks === 1 ? "sem" : "sems"} · pico #{e.peak}
                </Text>
                <MovementBadge status={e.status as MovementStatus} delta={e.delta ?? undefined} compact />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
