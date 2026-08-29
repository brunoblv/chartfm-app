import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { NOTIFS_TODAY, NOTIFS_WEEK } from "../data/mock";

export function NotificationsScreen() {
  const { colors } = useAppTheme();

  return (
    <Screen>
      <BackHeader
        title="Notificações"
        action={
          <Pressable>
            <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "600" }}>Marcar lidas</Text>
          </Pressable>
        }
      />

      <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted, paddingHorizontal: 20, paddingBottom: 8 }}>
        Hoje
      </Text>
      <View style={{ marginHorizontal: 16, marginBottom: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
        {NOTIFS_TODAY.map((n, i) => (
          <View
            key={n.text}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 11,
              padding: 13,
              borderBottomWidth: i === NOTIFS_TODAY.length - 1 ? 0 : 1,
              borderBottomColor: colors.dividerSoft,
              backgroundColor: n.unread ? colors.accentTint : "transparent",
            }}
          >
            <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: colors.fillSubtle, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontWeight: "800", fontSize: 12, color: colors.textSubtle }}>{n.mark}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 13.5, lineHeight: 19, color: colors.text }}>{n.text}</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>{n.when}</Text>
            </View>
            {n.unread && <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.accent, marginTop: 6 }} />}
          </View>
        ))}
      </View>

      <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted, paddingHorizontal: 20, paddingBottom: 8 }}>
        Esta semana
      </Text>
      <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
        {NOTIFS_WEEK.map((n, i) => (
          <View
            key={n.text}
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 11, padding: 13, borderBottomWidth: i === NOTIFS_WEEK.length - 1 ? 0 : 1, borderBottomColor: colors.dividerSoft }}
          >
            <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: colors.fillSubtle, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontWeight: "800", fontSize: 12, color: colors.textSubtle }}>{n.mark}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 13.5, lineHeight: 19, color: colors.textSubtle }}>{n.text}</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>{n.when}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ margin: 16, backgroundColor: colors.fillSubtle, borderRadius: 14, padding: 14 }}>
        <Text style={{ fontSize: 12.5, color: colors.textSubtle, lineHeight: 18 }}>
          Você controla as categorias em Ajustes: parada, ranking, eventos, comunidade e conquistas.
        </Text>
      </View>
    </Screen>
  );
}
