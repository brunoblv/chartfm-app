import React from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CreateSheetScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();

  const Row = ({
    icon,
    label,
    onPress,
    muted,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
    muted?: boolean;
  }) => (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 20 }}>
      <View style={{ width: 19 }}>{icon}</View>
      <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, opacity: muted ? 0.5 : 1 }}>{label}</Text>
    </Pressable>
  );

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
          paddingBottom: 20,
        }}
      >
        <View style={{ alignItems: "center", paddingVertical: 10 }}>
          <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: colors.dividerStrong }} />
        </View>
        <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted, marginHorizontal: 20, marginTop: 8, marginBottom: 6 }}>
          Criar
        </Text>
        <Row
          icon={
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={1.8} strokeLinecap="round">
              <Path d="M4 6h11M4 12h11M4 18h7M18 8v10M18 8l3 2M18 8l-3 2" />
            </Svg>
          }
          label="Minha parada da semana"
          onPress={() => {
            navigation.goBack();
            navigation.navigate("Editor");
          }}
        />
        <Row
          icon={
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={1.8}>
              <Circle cx={12} cy={12} r={9} />
              <Circle cx={12} cy={12} r={2.6} />
            </Svg>
          }
          label="Ranking de álbuns"
          muted
        />
        <Row
          icon={
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={1.8} strokeLinecap="round">
              <Path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v5a4 4 0 0 0 4 4z" />
              <Path d="M8 20h8M12 15v5" />
            </Svg>
          }
          label="Ranking de artistas"
          muted
        />
        <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: 6 }} />
        <Row
          icon={
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={1.8} strokeLinecap="round">
              <Path d="M12 3v12M12 15l-4-4M12 15l4-4M4 19h16" />
            </Svg>
          }
          label="Importar do Last.fm"
          onPress={() => {
            navigation.goBack();
            navigation.navigate("Lastfm");
          }}
        />
      </View>
    </View>
  );
}
