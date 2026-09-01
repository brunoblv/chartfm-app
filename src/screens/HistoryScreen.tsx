import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useAppTheme } from "../theme/ThemeProvider";
import {
  useProfileHistoryQuery,
  HISTORY_FILTERS,
  HISTORY_FILTER_LABELS,
  HistoryFilter,
  HistoryEvent,
  historyEventVerb,
} from "../api/history";
import { RootStackParamList } from "../navigation/RootNavigator";

type Route = RouteProp<RootStackParamList, "History">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function EventRow({ event, navigation }: { event: HistoryEvent; navigation: Nav }) {
  const { colors } = useAppTheme();
  const chartMatch = event.href?.match(/^\/chart\/([^/]+)/);
  const profileMatch = event.href?.match(/^\/profile\/([^/]+)/);

  const handlePress = () => {
    if (chartMatch) navigation.navigate("ChartDetail", { chartId: chartMatch[1] });
    else if (profileMatch) navigation.navigate("UserDetail", { handle: decodeURIComponent(profileMatch[1]) });
  };

  const navigable = Boolean(chartMatch || profileMatch);

  return (
    <Pressable
      onPress={navigable ? handlePress : undefined}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.dividerSoft,
      }}
    >
      <Text style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 3 }}>{formatDate(event.at)}</Text>
      <Text style={{ fontSize: 14, color: colors.text }}>
        Você {historyEventVerb(event.kind)}{" "}
        <Text style={{ fontWeight: "700" }}>{event.target}</Text>
      </Text>
      {event.excerpt ? (
        <Text numberOfLines={2} style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 4 }}>
          "{event.excerpt}"
        </Text>
      ) : null}
    </Pressable>
  );
}

export function HistoryScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const handle = route.params?.handle;
  const [filter, setFilter] = useState<HistoryFilter>("todos");
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const query = useProfileHistoryQuery(handle, filter, page);

  useEffect(() => {
    setPage(1);
    setEvents([]);
  }, [filter, handle]);

  useEffect(() => {
    if (!query.data) return;
    setEvents((prev) => (page === 1 ? query.data!.events : [...prev, ...query.data!.events]));
  }, [query.data]);

  return (
    <Screen scroll={false}>
      <BackHeader title="Histórico" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}>
        {HISTORY_FILTERS.map((f) => (
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
              {HISTORY_FILTER_LABELS[f]}
              {query.data?.counts[f] != null ? ` (${query.data.counts[f]})` : ""}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {query.isLoading && page === 1 ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 30 }} />
      ) : events.length === 0 ? (
        <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 40 }}>
          Nenhuma atividade nessa categoria ainda.
        </Text>
      ) : (
        <ScrollView>
          {events.map((e) => (
            <EventRow key={e.key} event={e} navigation={navigation} />
          ))}
          {query.data?.hasMore && (
            <Pressable onPress={() => setPage((p) => p + 1)} style={{ paddingVertical: 16, alignItems: "center" }}>
              {query.isFetching ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 13 }}>Carregar mais</Text>
              )}
            </Pressable>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}
