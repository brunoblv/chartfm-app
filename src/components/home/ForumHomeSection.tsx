import React from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../../theme/ThemeProvider";
import { useTr } from "../../i18n/useTr";
import { UserAvatar } from "../UserAvatar";
import { ForumFeedItem } from "../../api/homeHub";
import { relativeTime } from "../../api/forum";

/** Card chamando para conhecer o Fórum + os tópicos mais novos em destaque (espelha `ForumSection` do site). */
export function ForumHomeSection({
  topics,
  onOpenForum,
  onOpenTopic,
}: {
  topics: ForumFeedItem[];
  onOpenForum: () => void;
  onOpenTopic: (topicId: string) => void;
}) {
  const { colors, lang } = useAppTheme();
  const tr = useTr();

  return (
    <View>
      <LinearGradient
        colors={["#3B2B8C", "#FA243C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ marginHorizontal: 16, borderRadius: 18, padding: 18 }}
      >
        <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: "#fff", opacity: 0.85 }}>
          {tr("Novo por aqui")}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.4, color: "#fff", marginTop: 5 }}>
          {tr("Conheça o Fórum do ChartFM")}
        </Text>
        <Text style={{ fontSize: 13.5, lineHeight: 20, color: "#fff", opacity: 0.9, marginTop: 6 }}>
          {tr("Converse sobre lançamentos, clipes, charts e tudo que está movimentando a música. Abra um tópico ou entre numa conversa.")}
        </Text>
        <Pressable
          onPress={onOpenForum}
          accessibilityRole="button"
          style={{ alignSelf: "flex-start", marginTop: 14, backgroundColor: "#fff", borderRadius: 100, paddingHorizontal: 18, paddingVertical: 10 }}
        >
          <Text style={{ color: "#0A0A0E", fontWeight: "700", fontSize: 13.5 }}>{tr("Conhecer o Fórum")}</Text>
        </Pressable>
      </LinearGradient>

      {topics.map((t) => (
        <Pressable
          key={t.id}
          onPress={() => onOpenTopic(t.topicId)}
          accessibilityRole="button"
          accessibilityLabel={t.topicTitle}
          style={({ pressed }) => ({
            marginHorizontal: 16,
            marginTop: 10,
            padding: 14,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.divider,
            backgroundColor: pressed ? colors.fillInset : colors.surface,
            gap: 7,
          })}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <UserAvatar name={t.author.name} color={t.author.avatarColor} imageUrl={t.author.image} size={26} />
            <Text numberOfLines={1} style={{ flex: 1, fontSize: 12.5, color: colors.textMuted }}>
              <Text style={{ fontWeight: "700", color: colors.text }}>{t.author.name}</Text>
              {` · ${relativeTime(t.createdAt, lang)}`}
            </Text>
            {t.tagLabel ? (
              <View style={{ paddingVertical: 2, paddingHorizontal: 8, borderRadius: 100, backgroundColor: (t.tagColor ?? "#86868B") + "1F" }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: t.tagColor ?? "#86868B" }}>{t.tagLabel}</Text>
              </View>
            ) : null}
          </View>
          <Text numberOfLines={2} style={{ fontSize: 15.5, fontWeight: "800", letterSpacing: -0.2, lineHeight: 20, color: colors.text }}>
            {t.topicTitle}
          </Text>
          {t.spoiler ? (
            <Text style={{ fontSize: 13, color: colors.textMuted }}>{tr("Contém spoiler. Abra para ler.")}</Text>
          ) : t.text ? (
            <Text numberOfLines={2} style={{ fontSize: 13, lineHeight: 18, color: colors.textSubtle }}>{t.text}</Text>
          ) : null}
          <Text style={{ fontSize: 12, color: colors.textMuted }}>
            {`${t.comments} ${tr("respostas")} · ${t.likes} ${tr("curtidas")}`}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
