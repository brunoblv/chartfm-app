import React from "react";
import { View, Text, Pressable, Image, Alert } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useAppTheme } from "../../theme/ThemeProvider";
import { Cover } from "../Cover";
import { FeedRecommendationItem, useLikeRecommendationMutation, feedErrorMessage } from "../../api/feed";
import { resolveMediaUrl } from "../../lib/api";

function HeartIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </Svg>
  );
}

const TYPE_LABEL: Record<string, string> = {
  recomendo: "recomendou",
  loop: "está no loop de",
  descobri: "descobriu",
  lancamento: "conferiu o lançamento",
  review: "avaliou",
  throwback: "trouxe de volta",
};

export function RecommendationFeedCard({ item }: { item: FeedRecommendationItem }) {
  const { colors } = useAppTheme();
  const likeMutation = useLikeRecommendationMutation();
  const [liked, setLiked] = React.useState(item.liked);
  const [likes, setLikes] = React.useState(item.likes);

  const handleLike = () => {
    if (likeMutation.isPending) return;
    setLiked((v) => !v);
    setLikes((v) => (liked ? v - 1 : v + 1));
    likeMutation.mutate(item.id, {
      onError: (e) => {
        setLiked(item.liked);
        setLikes(item.likes);
        Alert.alert("Não foi possível curtir", feedErrorMessage(e));
      },
    });
  };

  const title = item.kind === "youtube" ? item.youtube?.title ?? "Vídeo do YouTube" : item.song?.title ?? "Música";
  const subtitle = item.kind === "youtube" ? item.youtube?.channel ?? "" : item.song?.artist ?? "";

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {item.user.imageUrl ? (
          <Image source={{ uri: resolveMediaUrl(item.user.imageUrl) }} style={{ width: 32, height: 32, borderRadius: 16 }} />
        ) : (
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: item.user.avatar, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>{item.user.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 13, color: colors.text }}>
            <Text style={{ fontWeight: "700" }}>{item.user.name}</Text> {TYPE_LABEL[item.type] ?? "recomendou"}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>{item.postedAgo}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 }}>
        <Cover cover={{ palette: ["#1D1D1F", "#5B5B60"], seed: 0, imageUrl: item.song?.coverUrl ?? undefined }} size={44} rounded={9} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text }}>
            {title}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted }}>
            {subtitle}
          </Text>
        </View>
        {item.rating != null && (
          <Text style={{ fontSize: 13, fontWeight: "800", color: colors.accent }}>{item.rating}/10</Text>
        )}
      </View>

      {item.text && (
        <Text style={{ fontSize: 13, lineHeight: 18, color: colors.textSubtle, marginTop: 10 }}>{item.text}</Text>
      )}

      <View style={{ flexDirection: "row", alignItems: "center", gap: 20, marginTop: 12 }}>
        <Pressable onPress={handleLike} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <HeartIcon filled={liked} color={liked ? colors.accent : colors.textMuted} />
          <Text style={{ fontSize: 12, color: liked ? colors.accent : colors.textMuted, fontWeight: "600" }}>{likes}</Text>
        </Pressable>
        <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: "600" }}>{item.comments} comentários</Text>
      </View>
    </View>
  );
}
