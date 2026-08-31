import React from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Espelha `nav.createSheetTitle` do site (`components/layout/BottomNav.tsx`):
 * as mesmas três ações, na mesma ordem — montar parada, recomendar música,
 * avaliar álbum. O app tinha 4 itens antigos (ranking de álbuns/artistas,
 * desativados, e Last.fm como ação própria); ranking não existe no site e saiu,
 * e o Last.fm virou um atalho dentro do editor (`EditorScreen`), porque lá é
 * uma forma de montar a parada, não uma ação separada.
 */
export function CreateSheetScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();

  const Row = ({
    icon,
    label,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
  }) => (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 20 }}>
      <View style={{ width: 19 }}>{icon}</View>
      <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{label}</Text>
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
          O que você quer fazer
        </Text>
        <Row
          icon={
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={1.8} strokeLinecap="round">
              <Path d="M4 6h11M4 12h11M4 18h7M18 8v10M18 8l3 2M18 8l-3 2" />
            </Svg>
          }
          label="Montar uma parada"
          onPress={() => {
            navigation.goBack();
            navigation.navigate("Editor");
          }}
        />
        <Row
          icon={
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={1.8} strokeLinecap="round">
              <Path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z" />
            </Svg>
          }
          label="Recomendar uma música"
          onPress={() => {
            navigation.goBack();
            navigation.navigate("RecommendSong");
          }}
        />
        <Row
          icon={
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={1.8} strokeLinecap="round">
              <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </Svg>
          }
          label="Avaliar um álbum"
          onPress={() => {
            navigation.goBack();
            navigation.navigate("WriteReview");
          }}
        />
      </View>
    </View>
  );
}
