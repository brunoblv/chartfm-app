import React from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { useFeedQuery, FeedItem, FeedTab } from "../../api/feed";
import { ChartFeedCard } from "./ChartFeedCard";
import { RecommendationFeedCard } from "./RecommendationFeedCard";
import { SystemFeedCard } from "./SystemFeedCard";
import { EditorialFeedCard } from "./EditorialFeedCard";

function FeedItemRow({ entry }: { entry: FeedItem }) {
  switch (entry.kind) {
    case "chart":
      return <ChartFeedCard item={entry.item} />;
    case "recommendation":
      return <RecommendationFeedCard item={entry.item} />;
    case "system":
      return <SystemFeedCard item={entry.item} />;
    case "editorial":
      return <EditorialFeedCard item={entry.item} />;
    default:
      return null;
  }
}

export function FeedList({ tab }: { tab: FeedTab }) {
  const { colors } = useAppTheme();
  const query = useFeedQuery(tab);
  const items = (query.data?.pages ?? []).flatMap((p) => p.items);

  if (query.isLoading) {
    return <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />;
  }

  if (query.isError) {
    return (
      <View style={{ paddingVertical: 40, alignItems: "center", paddingHorizontal: 20 }}>
        <Text style={{ color: colors.textMuted, fontSize: 13.5, textAlign: "center" }}>
          Não foi possível carregar o feed.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(entry) => entry.id}
      renderItem={({ item }) => <FeedItemRow entry={item} />}
      contentContainerStyle={{ paddingTop: 4, paddingBottom: 24 }}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
      }}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={colors.text} />}
      ListEmptyComponent={
        <View style={{ paddingVertical: 40, alignItems: "center", paddingHorizontal: 20 }}>
          <Text style={{ color: colors.textMuted, fontSize: 13.5, textAlign: "center" }}>
            {tab === "following" ? "Siga outras pessoas para ver as paradas delas aqui." : "Nada por aqui ainda."}
          </Text>
        </View>
      }
      ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator color={colors.text} style={{ marginVertical: 16 }} /> : null}
    />
  );
}
