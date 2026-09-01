import React from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function OptionCard({
  icon,
  title,
  description,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 16,
        padding: 16,
      }}
    >
      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" }}>
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>{title}</Text>
        <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2, lineHeight: 17 }}>{description}</Text>
      </View>
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={2.2} strokeLinecap="round">
        <Path d="M9 18l6-6-6-6" />
      </Svg>
    </Pressable>
  );
}

/**
 * Espelha a escolha de `/create/start` no site: antes de cair no editor livre,
 * a pessoa escolhe como quer montar a parada. "Do zero" leva pro mesmo editor
 * de sempre (busca manual + destaques); "Last.fm" pula direto pro import —
 * um toque, sem etapa extra, igual ao botão do site.
 */
export function CreateGuidedScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Nova parada" />
      <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <Text style={{ fontSize: 14, color: colors.textMuted, lineHeight: 20 }}>
          Como você quer montar sua parada essa semana?
        </Text>
      </View>
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <OptionCard
          icon={
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={1.8} strokeLinecap="round">
              <Path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
              <Path d="M21 21l-4.35-4.35" />
            </Svg>
          }
          title="Buscar e montar do zero"
          description="Procure as músicas uma a uma, reordene e escolha os destaques da semana."
          onPress={() => navigation.navigate("Editor")}
        />
        <OptionCard
          icon={
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={1.8} strokeLinecap="round">
              <Path d="M12 3v12M12 15l-4-4M12 15l4-4M4 19h16" />
            </Svg>
          }
          title="Importar do Last.fm"
          description="Conecte sua conta e montamos a parada com o que você mais ouviu."
          onPress={() => navigation.navigate("Lastfm")}
        />
      </View>
    </View>
  );
}
