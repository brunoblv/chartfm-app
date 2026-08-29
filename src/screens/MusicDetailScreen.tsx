import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Svg, { Path, Polyline } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { Cover } from "../components/Cover";
import { PositionNumber } from "../components/PositionNumber";
import { MovementBadge, MovementStatus } from "../components/MovementBadge";
import { PEOPLE, TRACK_DETAIL } from "../data/mock";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MusicDetailScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackHeader
        action={
          <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={1.8} strokeLinecap="round">
            <Path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" />
          </Svg>
        }
      />

      <View style={{ alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18 }}>
        <Cover cover={TRACK_DETAIL.cover} size={176} rounded={20} />
        <Text style={{ fontSize: 23, fontWeight: "800", letterSpacing: -0.5, color: colors.text, marginTop: 18, textAlign: "center" }}>
          {TRACK_DETAIL.t}
        </Text>
        <Text style={{ fontSize: 15, color: colors.textMuted, marginTop: 4 }}>{TRACK_DETAIL.a}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
          <PositionNumber n={TRACK_DETAIL.p} size={22} />
          {TRACK_DETAIL.mv && <MovementBadge status={TRACK_DETAIL.mv as MovementStatus} delta={TRACK_DETAIL.d} />}
          <Text style={{ fontSize: 12.5, color: colors.textMuted }}>· Global 100</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 16 }}>
        <Pressable style={{ flex: 1, backgroundColor: colors.accent, borderRadius: 100, paddingVertical: 14, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14.5 }}>+ Adicionar à minha parada</Text>
        </Pressable>
        <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.dividerStrong, alignItems: "center", justifyContent: "center" }}>
          <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={1.8} strokeLinecap="round">
            <Path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
            <Path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
          </Svg>
        </View>
      </View>

      <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.4, color: colors.text, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 12 }}>
        Trajetória no Global 100
      </Text>
      <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 18 }}>
        <Svg width="100%" height={64} viewBox="0 0 300 64" preserveAspectRatio="none">
          <Polyline
            points="0,44 40,30 80,36 120,14 160,20 200,6 240,12 300,4"
            fill="none"
            stroke={colors.accent}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>12 semanas atrás</Text>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>pico #1</Text>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>hoje</Text>
        </View>
      </View>

      <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.4, color: colors.text, paddingHorizontal: 20, paddingTop: 26, paddingBottom: 12 }}>
        Quem tem no Top 20
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16 }}>
        {PEOPLE.map((u) => (
          <Pressable key={u.handle} onPress={() => navigation.navigate("UserDetail")} style={{ width: 112, alignItems: "center" }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: u.avatar[0], alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>{u.initial}</Text>
            </View>
            <Text numberOfLines={1} style={{ fontSize: 12.5, fontWeight: "700", color: colors.text, marginTop: 8 }}>
              {u.handle}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </ScrollView>
  );
}
