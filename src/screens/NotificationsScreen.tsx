import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useFollowMutation } from "../api/profile";
import { useNotificationsQuery, useMarkNotificationsReadMutation, relativeWhen, bucketOf, matchesFilter, NotifFilter, NotificationRow } from "../api/notifications";

function NotifRow({ n, last }: { n: NotificationRow; last: boolean }) {
  const { colors, lang } = useAppTheme();
  const follow = useFollowMutation();
  const [followed, setFollowed] = useState(false);
  const canFollowBack = n.type === "follow" && !!n.actor && n.isFollowingBack === false;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 11,
        padding: 13,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.dividerSoft,
        backgroundColor: !n.read ? colors.accentTint : "transparent",
      }}
    >
      <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: colors.fillSubtle, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontWeight: "800", fontSize: 12, color: colors.textSubtle }}>
          {(n.actor?.name ?? n.type).charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 13.5, lineHeight: 19, color: colors.text }}>
          {n.actor ? <Text style={{ fontWeight: "700" }}>{n.actor.name} </Text> : null}
          {n.text}
        </Text>
        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>{relativeWhen(n.createdAt, lang)}</Text>
        {canFollowBack && (
          followed ? (
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 10 }}>{lang === "en" ? "Following" : "Seguindo"}</Text>
          ) : (
            <Pressable
              disabled={follow.isPending}
              onPress={() => follow.mutate(n.actor!.id, { onSuccess: () => setFollowed(true) })}
              style={{ alignSelf: "flex-start", marginTop: 10, backgroundColor: colors.btnDarkBg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 }}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.btnDarkFg }}>{lang === "en" ? "Follow back" : "Seguir de volta"}</Text>
            </Pressable>
          )
        )}
      </View>
      {!n.read && <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.accent, marginTop: 6 }} />}
    </View>
  );
}

export function NotificationsScreen() {
  const { colors, lang } = useAppTheme();
  const en = lang === "en";
  const { data, isLoading } = useNotificationsQuery(true, lang);
  const markRead = useMarkNotificationsReadMutation();

  const [filter, setFilter] = useState<NotifFilter>("all");
  const items = data ?? [];
  const counts = {
    all: items.length,
    like: items.filter((n) => matchesFilter(n.type, "like")).length,
    comment: items.filter((n) => matchesFilter(n.type, "comment")).length,
    follow: items.filter((n) => matchesFilter(n.type, "follow")).length,
  };
  const tabs = (
    [
      { id: "all", label: en ? "All" : "Todas" },
      { id: "like", label: en ? "Likes" : "Curtidas" },
      { id: "comment", label: en ? "Comments" : "Comentários" },
      { id: "follow", label: en ? "New followers" : "Novos seguidores" },
    ] as Array<{ id: NotifFilter; label: string }>
  ).filter((t) => t.id === "all" || counts[t.id] > 0);

  const groups = useMemo(() => {
    const now = Date.now();
    const shown = items.filter((n) => matchesFilter(n.type, filter));
    return (["today", "week", "earlier"] as const)
      .map((bucket) => ({ bucket, rows: shown.filter((n) => bucketOf(n.createdAt, now) === bucket) }))
      .filter((g) => g.rows.length > 0);
  }, [items, filter]);
  const bucketLabel = {
    today: en ? "Today" : "Hoje",
    week: en ? "This week" : "Esta semana",
    earlier: en ? "Earlier" : "Anteriores",
  };

  return (
    <Screen>
      <BackHeader
        title={en ? "Notifications" : "Notificações"}
        action={
          <Pressable onPress={() => markRead.mutate()} disabled={markRead.isPending}>
            <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "600" }}>{en ? "Mark as read" : "Marcar lidas"}</Text>
          </Pressable>
        }
      />

      {tabs.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 14 }}>
          {tabs.map((t) => {
            const on = filter === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setFilter(t.id)}
                style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, backgroundColor: on ? colors.text : colors.fillSubtle }}
              >
                <Text style={{ fontSize: 12.5, fontWeight: "600", color: on ? colors.bg : colors.text }}>{t.label}</Text>
                <Text style={{ fontSize: 11.5, color: on ? colors.bg : colors.textMuted }}>{counts[t.id]}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : groups.length === 0 ? (
        <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 40 }}>
          {items.length === 0 ? (en ? "No notifications yet." : "Nenhuma notificação ainda.") : en ? "Nothing in this filter." : "Nada neste filtro."}
        </Text>
      ) : (
        groups.map((g) => (
          <View key={g.bucket}>
            <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted, paddingHorizontal: 20, paddingBottom: 8 }}>
              {bucketLabel[g.bucket]}
            </Text>
            <View style={{ marginHorizontal: 16, marginBottom: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
              {g.rows.map((n, i) => (
                <NotifRow key={n.id} n={n} last={i === g.rows.length - 1} />
              ))}
            </View>
          </View>
        ))
      )}

      <View style={{ margin: 16, backgroundColor: colors.fillSubtle, borderRadius: 14, padding: 14 }}>
        <Text style={{ fontSize: 12.5, color: colors.textSubtle, lineHeight: 18 }}>
          {en
            ? "You control the categories in Settings: chart, ranking, events, community and achievements."
            : "Você controla as categorias em Ajustes: parada, ranking, eventos, comunidade e conquistas."}
        </Text>
      </View>
    </Screen>
  );
}
