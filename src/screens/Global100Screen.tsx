import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { SongRow } from "../components/SongRow";
import { VideoClipCover } from "../components/VideoClipCover";
import { GLOBAL } from "../data/mock";

const TABS = [
  { id: "songs", label: "Músicas" },
  { id: "albums", label: "Álbuns" },
  { id: "artists", label: "Artistas" },
  { id: "clips", label: "Clipes" },
] as const;

export function Global100Screen() {
  const { colors } = useAppTheme();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("songs");

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 24 }}>
      <BackHeader />

      <View style={{ marginHorizontal: 16, backgroundColor: "#1D1D1F", borderRadius: 18, padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8}>
              <Circle cx={12} cy={12} r={10} />
              <Line x1={2} y1={12} x2={22} y2={12} />
              <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </Svg>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 11, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
              Semana 35 · 2026
            </Text>
            <Text style={{ fontSize: 32, fontWeight: "800", letterSpacing: -0.7, color: "#fff", marginTop: 4 }}>Global 100</Text>
          </View>
        </View>
        <Text style={{ fontSize: 13, lineHeight: 20, color: "rgba(255,255,255,0.8)", marginTop: 14, marginBottom: 12 }}>
          Sua parada vale pontos: a #1 de cada usuário soma 100 e a #20 soma 1.
        </Text>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>4.812 paradas</Text>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>·</Text>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>100 músicas</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
          <View style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", paddingVertical: 8, paddingHorizontal: 13, borderRadius: 10 }}>
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12.5 }}>‹ Semana 34</Text>
          </View>
          <View style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", paddingVertical: 8, paddingHorizontal: 13, borderRadius: 10 }}>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontWeight: "600", fontSize: 12.5 }}>Semana 36 ›</Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 16 }}>
        {TABS.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTab(t.id)}
            style={{ backgroundColor: tab === t.id ? colors.btnDarkBg : colors.fillSubtle, borderRadius: 100, paddingVertical: 10, paddingHorizontal: 15, marginRight: 8 }}
          >
            <Text style={{ color: tab === t.id ? colors.btnDarkFg : colors.textSubtle, fontWeight: "700", fontSize: 13 }}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {tab === "clips" ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 16 }}>
          {GLOBAL.map((s) => (
            <View key={s.t} style={{ width: "47%" }}>
              <VideoClipCover paletteA={s.cover.palette[0]} paletteB={s.cover.palette[1]} seed={s.cover.seed} width={170} />
              <View style={{ flexDirection: "row", gap: 6, marginTop: 7 }}>
                <Text style={{ fontSize: 12, fontWeight: "800", color: colors.textMuted }}>{s.p}</Text>
                <View style={{ minWidth: 0, flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>
                    {s.t}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 11, color: colors.textMuted }}>
                    {s.a}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
          {GLOBAL.map((s, i) => (
            <SongRow key={s.t} song={s} position={s.p} meta={s.meta} last={i === GLOBAL.length - 1} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
