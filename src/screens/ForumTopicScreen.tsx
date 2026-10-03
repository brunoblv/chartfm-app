import React from "react";
import { View, Text, Pressable, FlatList, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Share } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useTr } from "../i18n/useTr";
import { useAuth } from "../state/AuthContext";
import { UserAvatar } from "../components/UserAvatar";
import {
  ForumCommentItem,
  ForumCommentThread,
  forumErrorKey,
  relativeTime,
  useForumAddComment,
  useForumCommentLike,
  useForumCommentsQuery,
  useForumModerateTopic,
  useForumToggleLike,
  useForumToggleSave,
  useForumTopicQuery,
} from "../api/forum";
import { Badge, EmptyState, ICONS, Icon, LinkedMusicCard, TopicTag, UserLine } from "../components/forum/ForumParts";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "ForumTopic">;

export function ForumTopicScreen() {
  const tr = useTr();
  const { colors, lang } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { topicId } = useRoute<Route>().params;
  const { isSignedIn } = useAuth();

  const [sort, setSort] = React.useState<"relevant" | "recent">("relevant");
  const [text, setText] = React.useState("");
  const [replyTo, setReplyTo] = React.useState<{ id: string; name: string } | null>(null);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [spoilerOpen, setSpoilerOpen] = React.useState(false);

  const topicQ = useForumTopicQuery(topicId);
  const commentsQ = useForumCommentsQuery(topicId, sort);
  const like = useForumToggleLike(topicId);
  const save = useForumToggleSave(topicId);
  const commentLike = useForumCommentLike();
  const add = useForumAddComment(topicId);
  const moderate = useForumModerateTopic(topicId);
  const topic = topicQ.data;

  const requireLogin = () => {
    if (isSignedIn) return false;
    navigation.navigate("Login");
    return true;
  };

  const send = () => {
    if (requireLogin() || !text.trim()) return;
    add.mutate(
      { text: text.trim(), parentId: replyTo?.id ?? null },
      {
        onSuccess: () => { setText(""); setReplyTo(null); },
        onError: (e) => Alert.alert(tr("Não foi possível enviar"), tr(forumErrorKey(e))),
      },
    );
  };

  const openMenu = () => {
    if (!topic) return;
    const opts: { text: string; style?: "destructive" | "cancel"; onPress?: () => void }[] = [];
    opts.push({ text: tr("Compartilhar"), onPress: () => Share.share({ message: topic.title }) });
    if (!topic.isAuthor) opts.push({ text: tr("Denunciar"), onPress: () => !requireLogin() && navigation.navigate("ReportSheet", { targetType: "forum_topic", targetId: topic.id }) });
    if (topic.canModerate) {
      opts.push({ text: topic.pinned ? tr("Desafixar") : tr("Fixar"), onPress: () => moderate.mutate({ pinned: !topic.pinned }) });
      opts.push({ text: topic.closed ? tr("Reabrir") : tr("Fechar"), onPress: () => moderate.mutate({ closed: !topic.closed }) });
    }
    if (topic.canModerate || topic.isAuthor) {
      opts.push({
        text: tr("Excluir"),
        style: "destructive",
        onPress: () => moderate.mutate({ removed: true }, { onSuccess: () => navigation.goBack() }),
      });
    }
    opts.push({ text: tr("Cancelar"), style: "cancel" });
    Alert.alert(tr("Opções do tópico"), undefined, opts);
  };

  if (topicQ.isLoading) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader />
        <ActivityIndicator color={colors.textMuted} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }
  if (!topic) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader />
        <EmptyState title={tr("Tópico não encontrado")} action={{ label: tr("Tentar novamente"), onPress: () => topicQ.refetch() }} />
      </SafeAreaView>
    );
  }
  if (topic.removed) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader />
        <EmptyState title={tr("Este tópico foi removido.")} text={tr((topic as any).removedReason)} />
      </SafeAreaView>
    );
  }

  const head = (
    <View style={{ paddingHorizontal: 16, paddingBottom: 8, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <TopicTag tag={topic.tag} />
        {topic.closed && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon d={ICONS.lock} size={13} color={colors.textMuted} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.textMuted }}>{tr("Fechado")}</Text>
          </View>
        )}
      </View>
      <Text accessibilityRole="header" style={{ fontSize: 24, fontWeight: "800", letterSpacing: -0.6, color: colors.text, lineHeight: 30 }}>{topic.title}</Text>
      <UserLine user={topic.author} time={relativeTime(topic.createdAt, lang)} />
      <Text style={{ fontSize: 12, color: colors.textMuted }}>
        {`${topic.views} ${tr("visualizações")}${topic.editedAt ? ` · ${tr("editado")}` : ""}`}
      </Text>

      {topic.spoiler && !spoilerOpen ? (
        <Pressable onPress={() => setSpoilerOpen(true)} style={{ padding: 16, borderRadius: 14, backgroundColor: colors.fillSubtle, alignItems: "center" }}>
          <Text style={{ fontWeight: "700", color: colors.text }}>{tr("Este tópico contém spoiler")}</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>{tr("Toque para ler")}</Text>
        </Pressable>
      ) : (
        <Text selectable style={{ fontSize: 16, lineHeight: 26, color: colors.text }}>{topic.body}</Text>
      )}

      {topic.entity && <LinkedMusicCard entity={topic.entity} />}

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.divider }}>
        <ActionBtn
          icon={ICONS.heart}
          label={`${topic.likes}`}
          a11y={tr("Curtir")}
          active={topic.liked}
          onPress={() => !requireLogin() && like.mutate()}
        />
        <ActionBtn icon={ICONS.reply} label={`${topic.comments}`} a11y={tr("Responder")} onPress={() => (topic.closed ? null : setReplyTo(null))} />
        <ActionBtn icon={ICONS.bookmark} label={topic.saved ? tr("Salvo") : tr("Salvar")} a11y={tr("Salvar")} active={topic.saved} onPress={() => !requireLogin() && save.mutate()} />
        <View style={{ flex: 1 }} />
        <ActionBtn icon={ICONS.more} label="" a11y={tr("Mais opções")} onPress={openMenu} />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>{`${commentsQ.data?.total ?? topic.comments} ${tr("respostas")}`}</Text>
        <Pressable onPress={() => setSort(sort === "relevant" ? "recent" : "relevant")} hitSlop={8}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.accent }}>{sort === "relevant" ? tr("Mais relevantes") : tr("Mais recentes")}</Text>
        </Pressable>
      </View>
    </View>
  );

  const comments = commentsQ.data?.comments ?? [];

  const renderComment = (c: ForumCommentItem, isReply: boolean) => {
    if (c.removed) {
      return (
        <View style={{ paddingVertical: 8 }}>
          <Text style={{ fontSize: 13, color: colors.textMuted, fontStyle: "italic" }}>{tr("Resposta removida.")}</Text>
        </View>
      );
    }
    return (
      <View style={{ flexDirection: "row", gap: 10, paddingVertical: 10 }}>
        <UserAvatar name={c.author.name} color={c.author.avatarColor} imageUrl={c.author.image} size={isReply ? 28 : 36} />
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <Text style={{ fontSize: 13.5, fontWeight: "700", color: colors.text }}>{c.author.name}</Text>
            {c.isTopicAuthor && <Badge text={tr("Autor")} accent />}
            {c.author.moderator && <Badge text={tr("Moderação")} />}
            {c.featured && <Badge text={tr("Resposta em destaque")} accent />}
            <Text style={{ fontSize: 12.5, color: colors.textMuted }}>· {relativeTime(c.createdAt, lang)}</Text>
          </View>
          <Text selectable style={{ fontSize: 15, lineHeight: 22, color: colors.text }}>{c.text}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 18, marginTop: 2 }}>
            <Pressable
              onPress={() => !requireLogin() && commentLike.mutate(c.id)}
              accessibilityRole="button"
              accessibilityLabel={`${tr("Curtir")}, ${c.likes}`}
              hitSlop={10}
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Icon d={ICONS.heart} size={15} color={c.liked ? colors.accent : colors.textMuted} fill={c.liked ? colors.accent : undefined} />
              <Text style={{ fontSize: 12.5, fontWeight: "600", color: c.liked ? colors.accent : colors.textMuted }}>{c.likes}</Text>
            </Pressable>
            {!topic.closed && (
              <Pressable onPress={() => setReplyTo({ id: c.id, name: c.author.name })} hitSlop={10}>
                <Text style={{ fontSize: 12.5, fontWeight: "700", color: colors.textMuted }}>{tr("Responder")}</Text>
              </Pressable>
            )}
            <Pressable onPress={() => !requireLogin() && navigation.navigate("ReportSheet", { targetType: "forum_comment", targetId: c.id })} hitSlop={10}>
              <Text style={{ fontSize: 12.5, fontWeight: "700", color: colors.textMuted }}>{tr("Denunciar")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const renderThread = ({ item }: { item: ForumCommentThread }) => {
    const open = expanded.has(item.id);
    const shown = open ? item.replies : item.replies.slice(0, 2);
    const hiddenCount = item.replies.length - shown.length;
    return (
      <View style={{ paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
        {renderComment(item, false)}
        {shown.length > 0 && (
          <View style={{ marginLeft: 46, borderLeftWidth: 2, borderLeftColor: colors.divider, paddingLeft: 12 }}>
            {shown.map((r) => (
              <View key={r.id}>{renderComment(r, true)}</View>
            ))}
          </View>
        )}
        {hiddenCount > 0 && (
          <Pressable onPress={() => setExpanded(new Set(expanded).add(item.id))} style={{ marginLeft: 46, paddingVertical: 8, minHeight: 36 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.accent }}>
              {lang === "en" ? `View ${hiddenCount} more ${hiddenCount === 1 ? "reply" : "replies"}` : `Ver mais ${hiddenCount} ${hiddenCount === 1 ? "resposta" : "respostas"}`}
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={topic.title.length > 28 ? `${topic.title.slice(0, 28)}…` : topic.title} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          data={comments}
          keyExtractor={(c) => c.id}
          ListHeaderComponent={head}
          renderItem={renderThread}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            commentsQ.isLoading ? (
              <ActivityIndicator color={colors.textMuted} style={{ margin: 24 }} />
            ) : (
              <EmptyState title={tr("Ainda sem respostas")} text={topic.closed ? undefined : tr("Escreva a primeira.")} />
            )
          }
        />
        {topic.closed ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.surface }}>
            <Icon d={ICONS.lock} size={15} color={colors.textMuted} />
            <Text style={{ flex: 1, fontSize: 13.5, color: colors.textMuted }}>{tr("Este tópico está fechado para novas respostas.")}</Text>
          </View>
        ) : (
          <View style={{ borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.surface, padding: 10, gap: 6 }}>
            {replyTo && (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 }}>
                <Text style={{ fontSize: 12.5, color: colors.textMuted }}>{`${tr("Respondendo a")} ${replyTo.name}`}</Text>
                <Pressable onPress={() => setReplyTo(null)} hitSlop={10} accessibilityLabel={tr("Cancelar resposta")}>
                  <Icon d={ICONS.x} size={15} color={colors.textMuted} />
                </Pressable>
              </View>
            )}
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
              <TextInput
                value={text}
                onChangeText={setText}
                multiline
                maxLength={2000}
                editable={isSignedIn}
                onFocus={() => { if (!isSignedIn) navigation.navigate("Login"); }}
                placeholder={tr("Escreva uma resposta...")}
                placeholderTextColor={colors.textMuted}
                style={{ flex: 1, maxHeight: 110, minHeight: 44, borderRadius: 22, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, backgroundColor: colors.fillSubtle, fontSize: 15, color: colors.text }}
              />
              <Pressable
                onPress={send}
                disabled={!text.trim() || add.isPending}
                accessibilityRole="button"
                accessibilityLabel={tr("Enviar resposta")}
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", opacity: !text.trim() || add.isPending ? 0.45 : 1 }}
              >
                {add.isPending ? <ActivityIndicator color="#fff" /> : <Icon d={ICONS.send} size={18} color="#fff" />}
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ActionBtn({ icon, label, a11y, active, onPress }: { icon: string[]; label: string; a11y: string; active?: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  const c = active ? colors.accent : colors.textSubtle;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ? `${a11y}, ${label}` : a11y}
      style={({ pressed }) => ({ minHeight: 44, minWidth: 44, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, backgroundColor: pressed ? colors.fillSubtle : "transparent" })}
    >
      <Icon d={icon} size={18} color={c} fill={active && (icon === ICONS.heart || icon === ICONS.bookmark) ? c : undefined} />
      {label ? <Text style={{ fontSize: 13.5, fontWeight: "700", color: c }}>{label}</Text> : null}
    </Pressable>
  );
}
