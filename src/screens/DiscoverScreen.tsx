import React from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../theme/ThemeProvider";
import { Screen } from "../components/Screen";
import { SectionHeader } from "../components/SectionHeader";
import { Cover } from "../components/Cover";
import { SongRow } from "../components/SongRow";
import { TRENDING, POPULAR, PEOPLE, GLOBAL } from "../data/mock";

export function DiscoverScreen() {
  const { colors } = useAppTheme();
  const climbing = GLOBAL.slice(2, 6);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 30, fontWeight: "800", letterSpacing: -0.8, color: colors.text }}>Discover</Text>
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.fillSubtle, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 13 }}>
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round">
            <Circle cx={11} cy={11} r={7} />
            <Path d="M20 20l-3.5-3.5" />
          </Svg>
          <Text style={{ fontSize: 14.5, color: colors.textMuted }}>Músicas, artistas, paradas, pessoas</Text>
        </View>
      </View>

      <SectionHeader title="Em alta esta semana" />
      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16 }}>
        {TRENDING.map((c) => (
          <View key={c.t} style={{ width: 150 }}>
            <Cover cover={c.cover} size={150} rounded={14} />
            <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text, marginTop: 8 }}>
              {c.t}
            </Text>
            <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted }}>
              {c.a}
            </Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Paradas populares" />
      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16 }}>
        {POPULAR.map((pc) => (
          <View
            key={pc.handle}
            style={{ width: 230, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 14 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
              <LinearGradient colors={pc.avatar} style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>{pc.initial}</Text>
              </LinearGradient>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                  {pc.handle}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>{pc.meta}</Text>
              </View>
            </View>
            <View style={{ marginTop: 11, gap: 7 }}>
              {pc.top.map((r) => (
                <View key={r.p} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ width: 12, fontSize: 11.5, fontWeight: "800", color: colors.textMuted }}>{r.p}</Text>
                  <Cover cover={r.cover} size={26} rounded={6} />
                  <Text numberOfLines={1} style={{ flex: 1, fontSize: 12.5, fontWeight: "600", color: colors.text }}>
                    {r.t}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <SectionHeader title="Subindo rápido" />
      <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden", marginHorizontal: 16 }}>
        {climbing.map((s, i) => (
          <SongRow key={s.t} song={s} last={i === climbing.length - 1} />
        ))}
      </View>

      <SectionHeader title="Pessoas com gosto parecido" />
      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16 }}>
        {PEOPLE.map((u) => (
          <View
            key={u.handle}
            style={{ width: 132, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 16, alignItems: "center" }}
          >
            <LinearGradient colors={u.avatar} style={{ width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>{u.initial}</Text>
            </LinearGradient>
            <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 10 }}>
              {u.handle}
            </Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{u.match}</Text>
            <Pressable style={{ marginTop: 11, backgroundColor: colors.accent, borderRadius: 100, paddingVertical: 9, width: "100%", alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>Seguir</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </Screen>
  );
}
