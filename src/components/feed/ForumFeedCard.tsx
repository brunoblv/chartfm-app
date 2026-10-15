import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../../theme/ThemeProvider";
import { useTr } from "../../i18n/useTr";
import { UserAvatar } from "../UserAvatar";
import { FeedForumItem } from "../../api/feed";
import { relativeTime } from "../../api/forum";
import { RootStackParamList } from "../../navigation/RootNavigator";

/** Tópico novo ou resposta do Fórum no feed (espelha `FeedForumCard` do site). */
export function ForumFeedCard({ item }: { item: FeedForumItem }) {
  const { colors, lang } = useAppTheme();
  const tr = useTr();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isReply = item.type === "reply";

  return (
    <Pressable
      onPress={() => navigation.navigate("ForumTopic", { topicId: item.topicId })}
      accessibilityRole="button"
      accessibilityLabel={item.topicTitle}
      style={({ pressed }) => ({
        marginHorizontal: 16,
        marginBottom: 14,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.divider,
        backgroundColor: pressed ? colors.fillInset : colors.surface,
        flexDirection: "row",
        gap: 12,
      })}
    >
      <UserAvatar name={item.author.name} color={item.author.avatarColor} imageUrl={item.author.image} size={38} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 17 }}>
          <Text style={{ fontWeight: "700", color: colors.text, fontSize: 14 }}>{item.author.name}</Text>
          {` ${isReply ? tr("respondeu no Fórum") : tr("abriu um tópico no Fórum")} · ${relativeTime(item.createdAt, lang)}`}
        </Text>
        <Text numberOfLines={2} style={{ fontSize: 15.5, fontWeight: "800", letterSpacing: -0.2, color: colors.text, marginTop: 6, lineHeight: 20 }}>
          {item.topicTitle}
        </Text>
        {item.spoiler ? (
          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>{tr("Contém spoiler. Abra para ler.")}</Text>
        ) : item.text ? (
          <Text numberOfLines={3} style={{ fontSize: 13.5, lineHeight: 19, color: colors.textSubtle, marginTop: 4 }}>{item.text}</Text>
        ) : null}
        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>
          {`${item.comments} ${tr("respostas")}`}
          {item.tagLabel ? <Text style={{ fontWeight: "700", color: item.tagColor ?? colors.textMuted }}>{` · ${item.tagLabel}`}</Text> : null}
        </Text>
      </View>
    </Pressable>
  );
}
