import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { AchievementDetailModal } from "../components/AchievementDetailModal";
import { useAppTheme } from "../theme/ThemeProvider";
import { useProfileQuery, ProfileFamilyProgress } from "../api/profile";
import {
  ACHIEVEMENT_META,
  CATEGORY_FILTERS,
  CATEGORY_FILTER_LABELS,
  CategoryFilter,
  familyCategory,
} from "../data/achievements";
import { RootStackParamList } from "../navigation/RootNavigator";

type Route = RouteProp<RootStackParamList, "Achievements">;

export function AchievementsScreen() {
  const { colors } = useAppTheme();
  const route = useRoute<Route>();
  const handle = route.params?.handle;
  const profileQuery = useProfileQuery(handle);
  const profile = profileQuery.data;
  const [filter, setFilter] = useState<CategoryFilter>("todas");
  const [selected, setSelected] = useState<ProfileFamilyProgress | null>(null);

  const families = useMemo(() => {
    const list = profile?.progression.families ?? [];
    if (filter === "todas") return list;
    return list.filter((f) => familyCategory(f.code, f.category) === filter);
  }, [profile?.progression.families, filter]);

  if (!handle) {
    return (
      <Screen>
        <BackHeader title="Conquistas" />
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>Perfil não encontrado.</Text>
      </Screen>
    );
  }

  const name = profile?.user.name ?? handle;
  const unlocked = profile?.progression.unlocked ?? 0;
  const total = profile?.progression.total ?? 0;
  const level = profile?.progression.level;

  return (
    <Screen scroll={false}>
      <BackHeader title="Conquistas" />

      {profileQuery.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : !profile ? (
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.textMuted }}>
          Não foi possível carregar as conquistas.
        </Text>
      ) : (
        <>
          <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
            <Text style={{ fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}>
              A trajetória de {name} no ChartFM. Cada família tem quatro etapas, e o progresso vem do que já foi
              publicado, avaliado e comentado.
            </Text>
            {level ? (
              <Text style={{ fontSize: 13, color: colors.text, marginTop: 10, fontWeight: "700" }}>
                Level {level.level} · {level.xp} XP
              </Text>
            ) : null}
            <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 4 }}>
              {unlocked} de {total} conquistas desbloqueadas
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
          >
            {CATEGORY_FILTERS.map((f) => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 100,
                  backgroundColor: filter === f ? colors.accent : colors.fillSubtle,
                }}
              >
                <Text style={{ color: filter === f ? "#fff" : colors.text, fontWeight: "700", fontSize: 12.5 }}>
                  {CATEGORY_FILTER_LABELS[f]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {families.length === 0 ? (
            <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 40, paddingHorizontal: 24 }}>
              Nenhuma conquista saiu ainda nessa categoria.
            </Text>
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 10 }}>
              {families.map((f) => {
                const meta = ACHIEVEMENT_META[f.code];
                return (
                  <Pressable
                    key={f.code}
                    onPress={() => setSelected(f)}
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.divider,
                      borderRadius: 16,
                      padding: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      opacity: f.tier ? 1 : 0.55,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: colors.accentTint,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontWeight: "800", fontSize: 12, color: colors.accent }}>{f.unlockedTiers}/4</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                        {meta?.title ?? f.code}
                      </Text>
                      <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                        {f.isComplete ? "Família completa" : `${f.value} de ${f.nextThreshold}`}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </>
      )}

      <AchievementDetailModal family={selected} onClose={() => setSelected(null)} />
    </Screen>
  );
}
