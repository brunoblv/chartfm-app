import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { UserAvatar } from "../components/UserAvatar";
import { ErrorState } from "../components/ErrorState";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useAuth } from "../state/AuthContext";
import { EXTRA_CATEGORIES, ExtraCategory, ScorePlayer, useCommunityRankingQuery } from "../api/ranking";
import { useTr } from "../i18n/useTr";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Tab = "overall" | "clip" | "push" | "extras";

const TABS: Tab[] = ["overall", "clip", "push", "extras"];

function fmt(n: number) {
  return n.toLocaleString("pt-BR");
}

export function CommunityRankingScreen() {
  const tr = useTr();
  const { colors, lang } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { isSignedIn } = useAuth();
  const query = useCommunityRankingQuery();
  const [tab, setTab] = useState<Tab>("overall");
  const data = query.data;
  const me = data?.me ?? null;
  const meId = me?.userId ?? null;

  const tabLabel: Record<Tab, string> = {
    overall: tr("Geral"),
    clip: tr("Qual é o Clipe?"),
    push: tr("Push"),
    extras: tr("Extras"),
  };
  const categoryLabel: Record<ExtraCategory, string> = {
    destaque: tr("Melhor da Semana"),
    flashback: tr("Flashback"),
    nacional: tr("Destaque Nacional"),
    push: tr("Destaque Push"),
  };

  const row = (opts: { key: string; position: number; player: ScorePlayer; value: string; caption: string; sub?: string }) => {
    const isMe = meId !== null && opts.player.userId === meId;
    return (
      <Pressable
        key={opts.key}
        onPress={() => navigation.navigate("UserDetail", { handle: opts.player.handle })}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 11,
          paddingHorizontal: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.dividerSoft,
          backgroundColor: isMe ? colors.accentTint : colors.surface,
        }}
      >
        <Text style={{ width: 28, fontSize: opts.position <= 3 ? 18 : 15, fontWeight: "800", letterSpacing: -0.5, color: opts.position <= 3 ? colors.accent : colors.text }}>
          {opts.position}
        </Text>
        <UserAvatar name={opts.player.name} color={opts.player.avatarColor} imageUrl={opts.player.image} size={34} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>{opts.player.name}</Text>
          <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 1 }}>
            {opts.sub ?? `@${opts.player.handle}`}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.4, color: colors.text }}>{opts.value}</Text>
          <Text style={{ fontSize: 9.5, fontWeight: "700", letterSpacing: 0.5, color: colors.textMuted, textTransform: "uppercase" }}>{opts.caption}</Text>
        </View>
      </Pressable>
    );
  };

  const list = (rows: React.ReactNode[], empty: string) =>
    rows.length === 0 ? (
      <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 30, paddingHorizontal: 30 }}>{empty}</Text>
    ) : (
      <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
        {rows}
      </View>
    );

  const renderBody = () => {
    if (!data) return null;
    if (tab === "overall") {
      return list(
        data.overall.map((r) =>
          row({
            key: r.player.userId,
            position: r.position,
            player: r.player,
            value: fmt(r.totalPoints),
            caption: tr("Total"),
            sub: `${tr("Qual é o Clipe?")} ${fmt(r.byGame.clip)} · Push ${fmt(r.byGame.push)}`,
          }),
        ),
        tr("Ninguém pontuou ainda."),
      );
    }
    if (tab === "clip" || tab === "push") {
      return list(
        data.games[tab].map((r) => {
          let sub: string | undefined;
          if (r.detail > 0) {
            if (tab === "clip") sub = lang === "en" ? `${r.detail} challenges` : `${r.detail} desafios`;
            else sub = lang === "en" ? `${r.detail} rounds won` : `${r.detail} rodadas vencidas`;
          }
          return row({ key: r.player.userId, position: r.position, player: r.player, value: fmt(r.points), caption: tr("Pontos"), sub });
        }),
        tr("Ninguém pontuou ainda."),
      );
    }
    return (
      <>
        <Text style={{ paddingHorizontal: 20, fontSize: 12.5, lineHeight: 18, color: colors.textMuted, marginBottom: 10 }}>
          {tr("Cada vez que uma música indicada por você na parada semanal vence a votação da semana, você ganha uma vitória no extra dela.")}
        </Text>
        {list(
          data.extras.map((r) =>
            row({
              key: r.player.userId,
              position: r.position,
              player: r.player,
              value: fmt(r.totalWins),
              caption: tr("Vitórias"),
              sub: EXTRA_CATEGORIES.filter((c) => r.byCategory[c] > 0)
                .map((c) => `${categoryLabel[c]} ${r.byCategory[c]}`)
                .join(" · "),
            }),
          ),
          tr("Nenhuma vitória nos extras ainda."),
        )}
      </>
    );
  };

  const statBox = (label: string, value: number, position: number | null) => (
    <View style={{ flexGrow: 1, flexBasis: "30%", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.divider }}>
      <Text numberOfLines={1} style={{ fontSize: 10.5, fontWeight: "700", color: colors.textMuted }}>{label}</Text>
      <Text style={{ fontSize: 19, fontWeight: "800", letterSpacing: -0.5, color: colors.text, marginTop: 3 }}>{fmt(value)}</Text>
      {position ? <Text style={{ fontSize: 11, color: colors.textMuted }}>#{position}</Text> : null}
    </View>
  );

  return (
    <Screen scroll={false}>
      <BackHeader title={tr("Ranking da comunidade")} />
      {query.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : query.isError || !data ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={colors.textMuted} />}
        >
          {me ? (
            <View style={{ marginHorizontal: 16, marginBottom: 16, padding: 18, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider }}>
              <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", color: colors.textMuted }}>
                {tr("Sua pontuação ChartFM")}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                <Text style={{ fontSize: 38, fontWeight: "800", letterSpacing: -1.2, color: colors.text }}>{fmt(me.totalPoints)}</Text>
                <Text style={{ fontSize: 14, color: colors.textMuted }}>{tr("pontos")}</Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                {me.position
                  ? lang === "en"
                    ? `#${me.position} in the community`
                    : `${me.position}º lugar na comunidade`
                  : tr("Jogue para entrar no ranking")}
              </Text>

              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.textMuted, marginTop: 16, marginBottom: 8 }}>{tr("Por jogo")}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {me.games.map((g) => (
                  <React.Fragment key={g.game}>
                    {statBox(g.game === "clip" ? tr("Qual é o Clipe?") : tr("Push"), g.points, g.position)}
                  </React.Fragment>
                ))}
                {statBox(tr("Vitórias nos extras"), me.extraWins.total, me.extraWins.position)}
              </View>

              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.textMuted, marginTop: 16, marginBottom: 6 }}>{tr("Suas vitórias semanais")}</Text>
              {me.recentWins.length === 0 ? (
                <Text style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 18 }}>
                  {tr("Quando uma música que você indicou vencer a votação da semana, ela aparece aqui.")}
                </Text>
              ) : (
                me.recentWins.map((win) => (
                  <View
                    key={`${win.weekIndex}-${win.category}-${win.songTitle}`}
                    style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.dividerSoft }}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>{win.songTitle}</Text>
                      <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted }}>{win.songArtist}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontSize: 11.5, fontWeight: "700", color: colors.accent }}>{categoryLabel[win.category]}</Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted }}>
                        {lang === "en" ? `Week ${win.weekLabel}` : `Semana ${win.weekLabel}`}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          ) : !isSignedIn ? (
            <Pressable onPress={() => navigation.navigate("Login")} style={{ marginHorizontal: 20, marginBottom: 16 }}>
              <Text style={{ fontSize: 13.5, color: colors.textMuted }}>
                {tr("Entre na sua conta para ver sua pontuação.")} <Text style={{ color: colors.accent, fontWeight: "700" }}>{tr("Entrar")}</Text>
              </Text>
            </Pressable>
          ) : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 14 }}>
            {TABS.map((id) => (
              <Pressable
                key={id}
                onPress={() => setTab(id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === id }}
                style={{ paddingVertical: 8, paddingHorizontal: 15, borderRadius: 100, backgroundColor: tab === id ? colors.btnDarkBg : colors.fillSubtle }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: tab === id ? colors.btnDarkFg : colors.textMuted }}>{tabLabel[id]}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {renderBody()}

          <View style={{ marginHorizontal: 20, marginTop: 26 }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text }}>{tr("Como funciona")}</Text>
            <Text style={{ fontSize: 12.5, lineHeight: 19, color: colors.textMuted, marginTop: 6 }}>
              {tr("A pontuação ChartFM soma os pontos de carreira no Qual é o Clipe? e no Push. As vitórias dos extras (Melhor da Semana, Flashback, Destaque Nacional e Destaque Push) são contadas à parte e não somam pontos, para o Push não contar duas vezes.")}
            </Text>
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}
