import React from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { Screen } from "../components/Screen";
import { SectionHeader } from "../components/SectionHeader";
import { Cover } from "../components/Cover";
import { COPA_A, COPA_B, CLUBE_COVER } from "../data/mock";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function EventsScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text style={{ fontSize: 30, fontWeight: "800", letterSpacing: -0.8, color: colors.text }}>Eventos</Text>
        <Text style={{ fontSize: 13.5, color: colors.textMuted, marginTop: 6 }}>3 acontecendo agora</Text>
      </View>

      <View style={{ marginHorizontal: 16, borderRadius: 18, padding: 20, backgroundColor: "#1D1D1F" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF7A8A" }} />
          <Text style={{ fontSize: 10.5, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: "#FF7A8A" }}>
            Acontecendo agora
          </Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: "800", letterSpacing: -0.6, color: "#fff", marginTop: 10 }}>
          Copa do Mundo de Músicas
        </Text>
        <Text style={{ fontSize: 13.5, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
          Oitavas de final · encerra em 14h
        </Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 16, alignItems: "center" }}>
          <Cover cover={COPA_A.cover} size={54} />
          <Text style={{ fontSize: 12, fontWeight: "800", opacity: 0.6, color: "#fff" }}>VS</Text>
          <Cover cover={COPA_B.cover} size={54} />
          <Text style={{ flex: 1, fontSize: 12, opacity: 0.7, color: "#fff", lineHeight: 17 }}>
            8 confrontos hoje. Você votou em 0.
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("Copa")}
          style={{ marginTop: 16, backgroundColor: colors.accent, borderRadius: 100, paddingVertical: 15, alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Votar agora</Text>
        </Pressable>
      </View>

      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" }}>
            <Svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={2} strokeLinecap="round">
              <Path d="M13 2 4 14h6l-1 8 9-12h-6z" />
            </Svg>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>Push</Text>
            <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>
              Rodada 12 · 4 lançamentos para avaliar
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
          <View style={{ flex: 1, backgroundColor: colors.btnDarkBg, borderRadius: 100, paddingVertical: 13, alignItems: "center" }}>
            <Text style={{ color: colors.btnDarkFg, fontWeight: "700", fontSize: 13.5 }}>Participar</Text>
          </View>
          <View style={{ backgroundColor: colors.fillSubtle, borderRadius: 100, paddingVertical: 13, paddingHorizontal: 16 }}>
            <Text style={{ color: colors.textSubtle, fontWeight: "600", fontSize: 13.5 }}>Ver rodada</Text>
          </View>
        </View>
      </View>

      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Cover cover={CLUBE_COVER} size={54} rounded={12} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>Clube do Álbum</Text>
          <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>BRAT · Charli XCX</Text>
          <Text style={{ fontSize: 11.5, color: colors.accent, fontWeight: "600", marginTop: 4 }}>
            Faltam 2 dias para avaliar
          </Text>
        </View>
        <View style={{ backgroundColor: colors.fillSubtle, borderRadius: 100, paddingVertical: 10, paddingHorizontal: 14 }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 12.5 }}>Avaliar</Text>
        </View>
      </View>

      <SectionHeader title="Você participou" />
      <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.dividerSoft }}>
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.fillSubtle, alignItems: "center", justifyContent: "center" }}>
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={1.9} strokeLinecap="round">
              <Path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z" />
            </Svg>
          </View>
          <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 18, color: colors.text }}>
            Copa 2026 · 1ª fase — você acertou 5 de 8
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}>
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.fillSubtle, alignItems: "center", justifyContent: "center" }}>
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={1.9} strokeLinecap="round">
              <Path d="M12 3l2.2 5.6 5.8.4-4.5 3.8 1.5 5.8-5-3.2-5 3.2 1.5-5.8L4 9l5.8-.4z" />
            </Svg>
          </View>
          <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 18, color: colors.text }}>
            Clube do Álbum · semana 33 — sua nota 8,5
          </Text>
        </View>
      </View>
    </Screen>
  );
}
