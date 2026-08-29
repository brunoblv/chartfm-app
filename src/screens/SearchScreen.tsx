import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { Cover } from "../components/Cover";
import { GLOBAL } from "../data/mock";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS = ["Músicas", "Artistas", "Paradas", "Pessoas"];

export function SearchScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState("charli xcx");
  const [tab, setTab] = useState(0);

  const results = GLOBAL.filter((s) => s.a.toLowerCase().includes(query.toLowerCase()));
  const hasResults = query.trim().length > 0 && results.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 14 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
        >
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round">
            <Path d="M15 18l-6-6 6-6" />
          </Svg>
        </Pressable>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.fillSubtle, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 13 }}>
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2} strokeLinecap="round">
            <Circle cx={11} cy={11} r={7} />
            <Path d="M20 20l-3.5-3.5" />
          </Svg>
          <TextInput
            value={query}
            onChangeText={setQuery}
            style={{ flex: 1, fontSize: 14.5, fontWeight: "600", color: colors.text, padding: 0 }}
            placeholder="músicas, artistas, paradas, pessoas"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      {!hasResults ? (
        <View style={{ flex: 1, alignItems: "center", paddingTop: 80, paddingHorizontal: 40 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.fillSubtle, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.textDisabled} strokeWidth={1.8} strokeLinecap="round">
              <Circle cx={11} cy={11} r={7} />
              <Path d="M20 20l-3.5-3.5" />
            </Svg>
          </View>
          <Text style={{ fontSize: 17, fontWeight: "700", letterSpacing: -0.3, color: colors.text }}>Nada encontrado</Text>
          <Text style={{ fontSize: 13.5, color: colors.textMuted, lineHeight: 19, marginTop: 8, textAlign: "center", maxWidth: 250 }}>
            Não achamos músicas, artistas ou pessoas para "{query}". Tente outro termo.
          </Text>
        </View>
      ) : (
        <ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            {TABS.map((t, i) => (
              <View
                key={t}
                style={{ backgroundColor: i === tab ? colors.btnDarkBg : colors.fillSubtle, borderRadius: 100, paddingVertical: 9, paddingHorizontal: 14, marginRight: 8 }}
              >
                <Text style={{ color: i === tab ? colors.btnDarkFg : colors.textSubtle, fontWeight: "700", fontSize: 13 }}>{t}</Text>
              </View>
            ))}
          </ScrollView>

          <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted, paddingHorizontal: 20, paddingBottom: 8 }}>
            Artistas
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingBottom: 18 }}>
            <LinearGradient colors={["#8BC34A", "#CDDC39"]} style={{ width: 48, height: 48, borderRadius: 24 }} />
            <View>
              <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>Charli XCX</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>3 músicas no Global 100</Text>
            </View>
          </View>

          <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted, paddingHorizontal: 20, paddingBottom: 8 }}>
            Músicas
          </Text>
          <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
            {results.map((s, i) => (
              <Pressable
                key={s.t}
                onPress={() => navigation.navigate("MusicDetail")}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderBottomWidth: i === results.length - 1 ? 0 : 1, borderBottomColor: colors.dividerSoft }}
              >
                <Cover cover={s.cover} size={44} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                    {s.t}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
                    {s.a}
                  </Text>
                </View>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textDisabled} strokeWidth={2.2} strokeLinecap="round">
                  <Path d="M9 6l6 6-6 6" />
                </Svg>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
