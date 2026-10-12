import React from "react";
import { Linking, Pressable, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { Screen } from "../components/Screen";
import { PillButton } from "../components/PillButton";
import { useAppTheme } from "../theme/ThemeProvider";
import { useTr } from "../i18n/useTr";
import { useAuth } from "../state/AuthContext";
import { API_BASE_URL } from "../lib/api";

/** Única tela da conta banida: o site marca `banned` e ela não participa de mais nada. */
export function BannedScreen() {
  const tr = useTr();
  const { colors, lang } = useAppTheme();
  const { signOut } = useAuth();

  return (
    <Screen scroll={false} edges={["top", "bottom"]}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            backgroundColor: colors.downBg,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={colors.downFg} strokeWidth={2} strokeLinecap="round">
            <Circle cx={12} cy={12} r={9} />
            <Line x1={5.6} y1={5.6} x2={18.4} y2={18.4} />
          </Svg>
        </View>
        <Text style={{ fontSize: 26, fontWeight: "900", letterSpacing: -0.8, color: colors.text, textAlign: "center" }}>
          {tr("Sua conta foi banida")}
        </Text>
        <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textMuted, textAlign: "center", marginTop: 12 }}>
          {tr("Encontramos várias contas criadas no mesmo IP, o que vai contra as regras do ChartFM. Por isso, esta conta não pode mais participar do app nem do site.")}
        </Text>
        <Text style={{ fontSize: 13.5, lineHeight: 20, color: colors.textDisabled, textAlign: "center", marginTop: 12 }}>
          {tr("Você não pode publicar paradas, votar, comentar, jogar nem seguir ninguém.")}
        </Text>
        <PillButton
          label={tr("Sair da conta")}
          variant="dark"
          onPress={signOut}
          style={{ marginTop: 28, paddingHorizontal: 32, alignSelf: "center" }}
        />
        <Pressable
          onPress={() => Linking.openURL(`${API_BASE_URL}/${lang === "en" ? "en" : "pt"}/contact`)}
          hitSlop={8}
          style={{ marginTop: 18 }}
          accessibilityRole="link"
        >
          <Text style={{ fontSize: 13.5, color: colors.textMuted, textDecorationLine: "underline" }}>
            {tr("Acha que foi um engano? Fale com a gente")}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
