import React from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { ChartFMLogo } from "../components/ChartFMLogo";
import { PillButton } from "../components/PillButton";
import { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={[colors.gradientHero[0], colors.gradientHero[1]]}
        style={{
          position: "absolute",
          top: -140,
          right: -160,
          width: 420,
          height: 420,
          borderRadius: 210,
          opacity: 0.2,
        }}
      />
      <View style={{ flex: 1, justifyContent: "flex-end", padding: 28, paddingBottom: 40 }}>
        <View style={{ flex: 1, justifyContent: "center", gap: 26 }}>
          <ChartFMLogo size={56} />
          <View>
            <Text style={{ fontSize: 15, fontWeight: "700", letterSpacing: 4, textTransform: "uppercase", color: colors.accent }}>
              ChartFM
            </Text>
            <Text style={{ fontSize: 40, fontWeight: "800", letterSpacing: -1.6, lineHeight: 44, color: colors.text, marginTop: 14 }}>
              Sua música.{"\n"}Sua parada.{"\n"}Sua comunidade.
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 23, color: colors.textMuted, marginTop: 16, maxWidth: 290 }}>
              Monte seu Top 20 toda semana, veja como suas escolhas se comparam com as de outros fãs e acompanhe o
              Global 100.
            </Text>
          </View>
        </View>
        <PillButton label="Começar" onPress={() => navigation.replace("Main")} />
        <Pressable onPress={() => navigation.replace("Main")} style={{ marginTop: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>
            Já tem conta? <Text style={{ color: colors.accent, fontWeight: "600" }}>Entrar</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
