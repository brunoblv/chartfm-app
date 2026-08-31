import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { useParadasQuery } from "../api/paradas";

function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Só existe enquanto o usuário está escolhendo uma data passada; some ao voltar para "período atual". */
function usePastDateStepper(stepDays: number) {
  const [stepsBack, setStepsBack] = useState(0);
  const date = useMemo(() => {
    if (stepsBack === 0) return null;
    const d = new Date();
    d.setDate(d.getDate() - stepsBack * stepDays);
    return d;
  }, [stepsBack, stepDays]);
  return { stepsBack, setStepsBack, date };
}

export function ParadaWeekPickerSheet() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const { paradaId, setParadaId, weekDate, setWeekDate } = useAppState();
  const paradasQuery = useParadasQuery();
  const paradas = paradasQuery.data?.paradas ?? [];
  const selected = paradas.find((p) => p.id === paradaId) ?? paradas.find((p) => p.isPrimary) ?? paradas[0];
  const stepDays = selected?.cadence === "daily" ? 1 : 7;
  const stepper = usePastDateStepper(stepDays);

  const effectiveDate = weekDate ? new Date(`${weekDate}T00:00:00`) : stepper.date;

  const applyStep = (delta: number) => {
    const next = Math.max(0, stepper.stepsBack + delta);
    stepper.setStepsBack(next);
    if (next === 0) {
      setWeekDate(null);
    } else {
      const d = new Date();
      d.setDate(d.getDate() - next * stepDays);
      setWeekDate(toDateInput(d));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} onPress={() => navigation.goBack()} />
      <View
        style={{
          backgroundColor: colors.surfaceElevated,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderTopWidth: 0.5,
          borderTopColor: colors.divider,
          paddingBottom: 24,
        }}
      >
        <View style={{ alignItems: "center", paddingVertical: 10 }}>
          <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: colors.dividerStrong }} />
        </View>
        <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.5, color: colors.text, marginHorizontal: 20, marginBottom: 12 }}>
          Parada e período
        </Text>

        {paradasQuery.isLoading ? (
          <ActivityIndicator color={colors.text} style={{ marginVertical: 20 }} />
        ) : (
          <>
            <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted, marginHorizontal: 20, marginBottom: 6 }}>
              Parada
            </Text>
            {paradas.map((p) => {
              const isSelected = p.id === (paradaId ?? selected?.id);
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setParadaId(p.id)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, paddingHorizontal: 20 }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 1.6,
                      borderColor: isSelected ? colors.accent : colors.dividerStrong,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected ? <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.accent }} /> : null}
                  </View>
                  <Text style={{ fontSize: 14.5, fontWeight: "600", color: colors.text }}>{p.name}</Text>
                  {p.isPrimary ? (
                    <Text style={{ fontSize: 10.5, color: colors.textMuted }}>· principal</Text>
                  ) : null}
                </Pressable>
              );
            })}

            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1,
                textTransform: "uppercase",
                color: colors.textMuted,
                marginHorizontal: 20,
                marginTop: 14,
                marginBottom: 6,
              }}
            >
              Período
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20 }}>
              <Pressable
                onPress={() => applyStep(1)}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.4} strokeLinecap="round">
                  <Path d="M15 18l-6-6 6-6" />
                </Svg>
              </Pressable>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.text, textAlign: "center" }}>
                {effectiveDate
                  ? effectiveDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                  : "Período atual"}
              </Text>
              <Pressable
                onPress={() => applyStep(-1)}
                disabled={stepper.stepsBack === 0}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center", opacity: stepper.stepsBack === 0 ? 0.4 : 1 }}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.4} strokeLinecap="round">
                  <Path d="M9 18l6-6-6-6" />
                </Svg>
              </Pressable>
            </View>
          </>
        )}

        <Pressable
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20, marginHorizontal: 20, backgroundColor: colors.accent, borderRadius: 100, paddingVertical: 13, alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14.5 }}>Confirmar</Text>
        </Pressable>
      </View>
    </View>
  );
}
