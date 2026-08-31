import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useAppTheme } from "../theme/ThemeProvider";
import { familyLabel, ProfileFamilyProgress } from "../api/profile";
import { ACHIEVEMENT_META, TIER_ORDER, TIER_LABEL, TIER_XP } from "../data/achievements";

export function AchievementDetailModal({
  family,
  onClose,
}: {
  family: ProfileFamilyProgress | null;
  onClose: () => void;
}) {
  const { colors } = useAppTheme();
  if (!family) return null;

  const meta = ACHIEVEMENT_META[family.code];
  const title = meta?.title ?? familyLabel(family.code);
  const currentTierIndex = family.unlockedTiers;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            padding: 20,
            paddingBottom: 34,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 19, fontWeight: "800", letterSpacing: -0.4, color: colors.text }}>{title}</Text>
              {meta?.description ? (
                <Text style={{ fontSize: 13, lineHeight: 19, color: colors.textMuted, marginTop: 6 }}>
                  {meta.description}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.textSubtle} strokeWidth={2.2} strokeLinecap="round">
                <Path d="M18 6 6 18M6 6l12 12" />
              </Svg>
            </Pressable>
          </View>

          <View style={{ marginTop: 18, gap: 10 }}>
            {TIER_ORDER.map((tierId, i) => {
              const threshold = meta?.thresholds[i];
              const unlocked = i < currentTierIndex;
              const isNext = i === currentTierIndex;
              return (
                <View
                  key={tierId}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: isNext ? colors.accentTint : colors.fillSubtle,
                    borderWidth: isNext ? 1 : 0,
                    borderColor: colors.accent,
                    opacity: unlocked || isNext ? 1 : 0.55,
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: unlocked ? colors.accent : colors.fillInset,
                    }}
                  >
                    {unlocked ? (
                      <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                        <Path d="M20 6 9 17l-5-5" />
                      </Svg>
                    ) : (
                      <Text style={{ fontSize: 11, fontWeight: "800", color: colors.textMuted }}>{i + 1}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 13.5, fontWeight: "700", color: colors.text }}>{TIER_LABEL[tierId]}</Text>
                    <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 1 }}>
                      {threshold} {meta?.unit ?? ""} · {TIER_XP[tierId]} XP
                    </Text>
                  </View>
                  {unlocked && (
                    <Text style={{ fontSize: 11, fontWeight: "700", color: colors.accent }}>Desbloqueada</Text>
                  )}
                </View>
              );
            })}
          </View>

          <Text style={{ marginTop: 16, fontSize: 12, color: colors.textMuted, textAlign: "center" }}>
            Progresso atual: {family.value} {meta?.unit ?? ""}
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
