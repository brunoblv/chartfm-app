import React from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { Cover } from "../components/Cover";
import { PillButton } from "../components/PillButton";
import { COPA_A, COPA_B } from "../data/mock";

export function CopaScreen() {
  const { colors } = useAppTheme();
  const { copaVote, setCopaVote } = useAppState();
  const navigation = useNavigation();
  const voted = copaVote !== null;

  const Option = ({ side, song }: { side: "a" | "b"; song: typeof COPA_A }) => {
    const active = copaVote === side;
    const pct = side === "a" ? "63%" : "37%";
    const barColor = side === "a" ? colors.accent : colors.textMuted;
    return (
      <Pressable
        onPress={() => setCopaVote(side)}
        style={{
          borderWidth: 2,
          borderColor: active ? colors.accent : colors.divider,
          backgroundColor: colors.surface,
          borderRadius: 18,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <Cover cover={song.cover} size={76} rounded={12} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 17, fontWeight: "700", letterSpacing: -0.4, color: colors.text }}>
            {song.t}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>{song.a}</Text>
          {voted && (
            <View style={{ marginTop: 9 }}>
              <View style={{ height: 7, borderRadius: 4, backgroundColor: colors.fillSubtle, overflow: "hidden" }}>
                <View style={{ width: pct, height: "100%", backgroundColor: barColor }} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: "700", color: barColor, marginTop: 5 }}>{pct}</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
        >
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round">
            <Path d="M15 18l-6-6 6-6" />
          </Svg>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", letterSpacing: -0.4, color: colors.text }}>Copa do Mundo</Text>
          <Text style={{ fontSize: 11.5, color: colors.textMuted }}>Oitavas · confronto 3 de 8</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 18 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", letterSpacing: -0.6, lineHeight: 28, color: colors.text }}>
          Qual música passa para as quartas?
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <Option side="a" song={COPA_A} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
          <Text style={{ fontSize: 12, fontWeight: "800", color: colors.textMuted, letterSpacing: 1 }}>VS</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
        </View>
        <Option side="b" song={COPA_B} />
      </View>

      {voted ? (
        <>
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 18,
              backgroundColor: colors.upBg,
              borderRadius: 14,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 9,
            }}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.upFg} strokeWidth={2.4} strokeLinecap="round">
              <Path d="M20 6 9 17l-5-5" />
            </Svg>
            <Text style={{ color: colors.upFg, fontSize: 13.5, fontWeight: "600", flex: 1 }}>
              Voto registrado. 12.408 pessoas já votaram.
            </Text>
          </View>
          <View style={{ padding: 16 }}>
            <PillButton label="Próximo confronto" onPress={() => setCopaVote(null)} />
          </View>
        </>
      ) : (
        <Text style={{ paddingTop: 20, paddingHorizontal: 16, fontSize: 12.5, color: colors.textMuted, textAlign: "center" }}>
          Toque na capa para votar. Um voto por confronto.
        </Text>
      )}
    </SafeAreaView>
  );
}
