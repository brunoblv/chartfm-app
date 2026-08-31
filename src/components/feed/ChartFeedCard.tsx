import React from "react";
import { View, Text, Pressable, Image, Alert } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../../theme/ThemeProvider";
import { Cover } from "../Cover";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { FeedChartItem, useLikeChartMutation, useRepostChartMutation, feedErrorMessage } from "../../api/feed";
import { resolveMediaUrl } from "../../lib/api";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function HeartIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </Svg>
  );
}

function RepostIcon({ active, color }: { active: boolean; color: string }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17 1l4 4-4 4" />
      <Path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <Path d="M7 23l-4-4 4-4" />
      <Path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </Svg>
  );
}

function CommentIcon({ color }: { color: string }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-4-1L3 20l1-5.5a8.38 8.38 0 0 1-1-4A8.5 8.5 0 0 1 12.5 3a8.38 8.38 0 0 1 8.5 8.5z" />
    </Svg>
  );
}

export function ChartFeedCard({ item }: { item: FeedChartItem }) {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const likeMutation = useLikeChartMutation();
  const repostMutation = useRepostChartMutation();
  const [optimisticLiked, setOptimisticLiked] = React.useState(item.isLiked);
  const [optimisticLikes, setOptimisticLikes] = React.useState(item.chart.likes);

  const handleLike = () => {
    if (likeMutation.isPending) return;
    setOptimisticLiked((v) => !v);
    setOptimisticLikes((v) => (optimisticLiked ? v - 1 : v + 1));
    likeMutation.mutate(item.chart.id, {
      onError: (e) => {
        setOptimisticLiked(item.isLiked);
        setOptimisticLikes(item.chart.likes);
        Alert.alert("Não foi possível curtir", feedErrorMessage(e));
      },
    });
  };

  const handleRepost = () => {
    if (repostMutation.isPending) return;
    repostMutation.mutate(item.chart.id, {
      onError: (e) => Alert.alert("Não foi possível repostar", feedErrorMessage(e)),
    });
  };

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
      <Pressable
        onPress={() => navigation.navigate("UserDetail", { handle: item.user.handle })}
        style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14, paddingBottom: 10 }}
      >
        {item.user.imageUrl ? (
          <Image source={{ uri: resolveMediaUrl(item.user.imageUrl) }} style={{ width: 36, height: 36, borderRadius: 18 }} />
        ) : (
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: item.user.avatar, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>{item.user.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "700", color: colors.text }}>
            {item.user.name}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted }}>
            publicou {item.chart.paradaNome} · {item.postedAgo}
          </Text>
        </View>
      </Pressable>

      <View style={{ paddingHorizontal: 14, paddingBottom: 10 }}>
        {item.chart.entries.slice(0, 5).map((e) => (
          <View key={e.position} style={{ flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 5 }}>
            <Text style={{ width: 18, fontSize: 12, fontWeight: "800", color: colors.textMuted }}>{e.position}</Text>
            <Cover cover={{ ...e.cover, imageUrl: e.cover.imageUrl ?? undefined }} size={30} rounded={7} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 12.5, fontWeight: "600", color: colors.text }}>
                {e.song.title}
              </Text>
              <Text numberOfLines={1} style={{ fontSize: 11, color: colors.textMuted }}>
                {e.song.artist}
              </Text>
            </View>
          </View>
        ))}
        {item.chart.entries.length > 5 && (
          <Text style={{ fontSize: 11.5, color: colors.accent, fontWeight: "600", marginTop: 4 }}>
            + {item.chart.entries.length - 5} músicas
          </Text>
        )}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 22, paddingHorizontal: 14, paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.dividerSoft }}>
        <Pressable onPress={handleLike} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <HeartIcon filled={optimisticLiked} color={optimisticLiked ? colors.accent : colors.textMuted} />
          <Text style={{ fontSize: 12.5, color: optimisticLiked ? colors.accent : colors.textMuted, fontWeight: "600" }}>{optimisticLikes}</Text>
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <CommentIcon color={colors.textMuted} />
          <Text style={{ fontSize: 12.5, color: colors.textMuted, fontWeight: "600" }}>{item.chart.comments}</Text>
        </View>
        <Pressable onPress={handleRepost} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <RepostIcon active={repostMutation.isPending} color={colors.textMuted} />
          <Text style={{ fontSize: 12.5, color: colors.textMuted, fontWeight: "600" }}>{item.chart.reposts}</Text>
        </Pressable>
      </View>
    </View>
  );
}
