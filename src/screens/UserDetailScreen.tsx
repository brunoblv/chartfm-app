import React from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useAppTheme } from "../theme/ThemeProvider";
import { SongRow } from "../components/SongRow";
import { OTHER_USER } from "../data/mock";

export function UserDetailScreen() {
  const { colors } = useAppTheme();

  return (
    <Screen>
      <BackHeader />

      <View style={{ alignItems: "center", paddingHorizontal: 20, paddingBottom: 20 }}>
        <LinearGradient colors={OTHER_USER.avatar} style={{ width: 82, height: 82, borderRadius: 41, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 32 }}>{OTHER_USER.initial}</Text>
        </LinearGradient>
        <Text style={{ fontSize: 22, fontWeight: "800", letterSpacing: -0.6, color: colors.text, marginTop: 14 }}>{OTHER_USER.name}</Text>
        <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 1 }}>{OTHER_USER.handle}</Text>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 26, marginTop: 18 }}>
          {[
            [String(OTHER_USER.charts), "paradas"],
            [String(OTHER_USER.followers), "seguidores"],
            [OTHER_USER.match, "parecido"],
          ].map(([n, l]) => (
            <View key={l} style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{n}</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>{l}</Text>
            </View>
          ))}
        </View>
        <Pressable style={{ marginTop: 18, backgroundColor: colors.accent, borderRadius: 100, paddingVertical: 12, paddingHorizontal: 34 }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14.5 }}>Seguir</Text>
        </Pressable>
      </View>

      <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
        <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted, padding: 14, paddingBottom: 10 }}>
          Top 20 · semana 35
        </Text>
        {OTHER_USER.top.map((s, i) => (
          <SongRow key={s.t} song={s} position={s.p} last={i === OTHER_USER.top.length - 1} />
        ))}
      </View>
    </Screen>
  );
}
