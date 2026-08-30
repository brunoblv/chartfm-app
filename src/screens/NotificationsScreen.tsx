import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useNotificationsQuery, useMarkNotificationsReadMutation, isToday, relativeWhen, NotificationRow } from "../api/notifications";

function NotifRow({ n, last }: { n: NotificationRow; last: boolean }) {
  const { colors } = useAppTheme();
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
        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>{relativeWhen(n.createdAt)}</Text>
      </View>
      {!n.read && <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.accent, marginTop: 6 }} />}
    </View>
  );
}

export function NotificationsScreen() {
  const { colors } = useAppTheme();
  const { data, isLoading } = useNotificationsQuery(true);
  const markRead = useMarkNotificationsReadMutation();

  const today = (data ?? []).filter((n) => isToday(n.createdAt));
  const earlier = (data ?? []).filter((n) => !isToday(n.createdAt));

  return (
    <Screen>
      <BackHeader
        title="Notificações"
        action={
          <Pressable onPress={() => markRead.mutate()} disabled={markRead.isPending}>
            <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "600" }}>Marcar lidas</Text>
          </Pressable>
        }
      />

      {isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : (data ?? []).length === 0 ? (
        <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 40 }}>Nenhuma notificação ainda.</Text>
      ) : (
        <>
          {today.length > 0 && (
            <>
              <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted, paddingHorizontal: 20, paddingBottom: 8 }}>
                Hoje
              </Text>
              <View style={{ marginHorizontal: 16, marginBottom: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
                {today.map((n, i) => (
                  <NotifRow key={n.id} n={n} last={i === today.length - 1} />
                ))}
              </View>
            </>
          )}

          {earlier.length > 0 && (
            <>
              <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted, paddingHorizontal: 20, paddingBottom: 8 }}>
                Anteriores
              </Text>
              <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
                {earlier.map((n, i) => (
                  <NotifRow key={n.id} n={n} last={i === earlier.length - 1} />
                ))}
              </View>
            </>
          )}
        </>
      )}

      <View style={{ margin: 16, backgroundColor: colors.fillSubtle, borderRadius: 14, padding: 14 }}>
        <Text style={{ fontSize: 12.5, color: colors.textSubtle, lineHeight: 18 }}>
          Você controla as categorias em Ajustes: parada, ranking, eventos, comunidade e conquistas.
        </Text>
      </View>
    </Screen>
  );
}
