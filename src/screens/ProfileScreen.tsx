import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { Screen } from "../components/Screen";
import { SongRow } from "../components/SongRow";
import { GLOBAL, BADGES } from "../data/mock";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const { colors } = useAppTheme();
  const { showGamification } = useAppState();
  const navigation = useNavigation<Nav>();
  const profileTop = GLOBAL.slice(0, 5);

  const tabs = ["Minha parada", "Histórico", "Estatísticas", "Atividade"];

  return (
    <Screen>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 16, paddingBottom: 4, gap: 6 }}>
        <Pressable style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}>
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.textSubtle} strokeWidth={1.9} strokeLinecap="round">
            <Circle cx={12} cy={12} r={3} />
            <Path d="M12 3v2M12 19v2M4.5 7.5l1.7 1M17.8 15.5l1.7 1M4.5 16.5l1.7-1M17.8 8.5l1.7-1" />
          </Svg>
        </Pressable>
      </View>

      <View style={{ alignItems: "center", paddingHorizontal: 20, paddingBottom: 20 }}>
        <LinearGradient colors={[colors.gradientHero[0], colors.gradientHero[1]]} style={{ width: 82, height: 82, borderRadius: 41, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 32 }}>B</Text>
        </LinearGradient>
        <Text style={{ fontSize: 22, fontWeight: "800", letterSpacing: -0.6, color: colors.text, marginTop: 14 }}>Bruno</Text>
        <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 1 }}>@brunoblv</Text>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 26, marginTop: 18 }}>
          {[
            ["27", "paradas"],
            ["14", "conquistas"],
            ["82", "semanas"],
          ].map(([n, l]) => (
            <View key={l} style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{n}</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>{l}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginBottom: 14 }}>
        {tabs.map((t, i) => (
          <View
            key={t}
            style={{
              backgroundColor: i === 0 ? colors.btnDarkBg : colors.fillSubtle,
              borderRadius: 100,
              paddingVertical: 10,
              paddingHorizontal: 15,
              marginRight: 8,
            }}
          >
            <Text style={{ color: i === 0 ? colors.btnDarkFg : colors.textSubtle, fontWeight: i === 0 ? "700" : "600", fontSize: 13 }}>
              {t}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, padding: 14, paddingBottom: 10 }}>
          <Text style={{ flex: 1, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted }}>
            Semana 35 · publicada
          </Text>
          <Pressable onPress={() => navigation.navigate("Editor")}>
            <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "700" }}>Editar</Text>
          </Pressable>
        </View>
        {profileTop.map((s, i) => (
          <SongRow key={s.t} song={s} position={s.p} compact last={i === profileTop.length - 1} />
        ))}
      </View>

      {showGamification && (
        <>
          <View style={{ paddingHorizontal: 20, paddingTop: 26, paddingBottom: 12 }}>
            <Text style={{ fontSize: 19, fontWeight: "800", letterSpacing: -0.4, color: colors.text }}>Conquistas</Text>
          </View>
          <View style={{ marginHorizontal: 16, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {BADGES.map((b) => (
              <View
                key={b.name}
                style={{
                  width: "47%",
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.divider,
                  borderRadius: 14,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  opacity: b.unlocked ? 1 : 0.5,
                }}
              >
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontWeight: "800", fontSize: 13, color: colors.accent }}>{b.mark}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 12.5, fontWeight: "700", color: colors.text }}>
                    {b.name}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 10.5, color: colors.textMuted }}>
                    {b.note}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
