import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../../theme/ThemeProvider";
import { ChartFMLogo } from "../ChartFMLogo";
import { FeedSystemItem } from "../../api/feed";

export function SystemFeedCard({ item }: { item: FeedSystemItem }) {
  const { colors } = useAppTheme();
  return (
    <LinearGradient
      colors={[colors.gradientHero[0], colors.gradientHero[1]]}
      style={{ marginHorizontal: 16, marginBottom: 14, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }}
    >
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
        <ChartFMLogo size={18} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 13, lineHeight: 18, color: "#fff", fontWeight: "600" }}>{item.text}</Text>
        <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{item.postedAgo}</Text>
      </View>
    </LinearGradient>
  );
}
