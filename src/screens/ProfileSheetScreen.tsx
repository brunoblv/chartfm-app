import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAuth } from "../state/AuthContext";
import { useProfileQuery } from "../api/profile";
import { resolveMediaUrl } from "../lib/api";
import { SheetScaffold } from "../components/SheetScaffold";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useTr } from "../i18n/useTr";

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Espelha a `ProfileSheet` do site (`components/layout/BottomNav.tsx`): folha
 * que sobe ao tocar em "Eu", com cabeçalho (avatar, nome, level/XP) e uma
 * lista de atalhos. Comunidades e Loja ainda ficam de fora. Copa, Push
 * e Clube do site viraram o atalho "Eventos". CriticsFM tem tela própria.
 */
export function ProfileSheetScreen() {
  const tr = useTr();
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuth();
  const profileQuery = useProfileQuery(user?.handle);
  const profile = profileQuery.data;
  const progression = profile?.progression.level;

  const go = (fn: () => void) => {
    navigation.goBack();
    fn();
  };

  const Row = ({
    icon,
    label,
    onPress,
    danger,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 20 }}>
      <View style={{ width: 18 }}>{icon}</View>
      <Text style={{ fontSize: 15, fontWeight: "600", color: danger ? colors.downFg : colors.text }}>{label}</Text>
    </Pressable>
  );

  const Divider = () => <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: 6 }} />;

  const stroke = (color: string) => ({ fill: "none" as const, stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

  return (
    <SheetScaffold
      onClose={() => navigation.goBack()}
      sheetStyle={{
        backgroundColor: colors.surfaceElevated,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        borderTopWidth: 0.5,
        borderTopColor: colors.divider,
        paddingBottom: 20,
        maxHeight: "82%",
      }}
    >
        <View style={{ alignItems: "center", paddingVertical: 10 }}>
          <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: colors.dividerStrong }} />
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingBottom: 14 }}>
          {profile?.imageUrl ? (
            <Image source={{ uri: resolveMediaUrl(profile.imageUrl) }} style={{ width: 44, height: 44, borderRadius: 22 }} />
          ) : (
            <LinearGradient colors={[colors.gradientHero[0], colors.gradientHero[1]]} style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 17 }}>
                {(user?.name ?? user?.handle ?? "?").charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", letterSpacing: -0.3, color: colors.text }} numberOfLines={1}>
              {user?.name ?? user?.handle}
            </Text>
            {progression && (
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                {tr("Nível")} {progression.level} · {progression.xp} XP
              </Text>
            )}
          </View>
        </View>

        {progression && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.fillSubtle, overflow: "hidden" }}>
              <View style={{ width: `${progression.percent}%`, height: "100%", backgroundColor: colors.accent }} />
            </View>
          </View>
        )}

        <Divider />

        <Row
          icon={<Svg width={18} height={18} viewBox="0 0 24 24" {...stroke(colors.textMuted)}><Circle cx={12} cy={12} r={4} /><Path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></Svg>}
          label={tr("Meu perfil")}
          onPress={() => go(() => navigation.navigate("Main", { screen: "Profile" } as never))}
        />
        <Row
          icon={<Svg width={18} height={18} viewBox="0 0 24 24" {...stroke(colors.textMuted)}><Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></Svg>}
          label={tr("Conversas")}
          onPress={() => go(() => navigation.navigate("Conversas"))}
        />
        <Row
          icon={<Svg width={18} height={18} viewBox="0 0 24 24" {...stroke(colors.textMuted)}><Path d="M12 8v4l3 3" /><Circle cx={12} cy={12} r={9} /></Svg>}
          label={tr("Histórico")}
          onPress={() => go(() => navigation.navigate("History", { handle: user?.handle ?? "" }))}
        />
        <Row
          icon={<Svg width={18} height={18} viewBox="0 0 24 24" {...stroke(colors.textMuted)}><Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></Svg>}
          label={tr("Biblioteca")}
          onPress={() => go(() => navigation.navigate("Library"))}
        />
        <Row
          icon={<Svg width={18} height={18} viewBox="0 0 24 24" {...stroke(colors.textMuted)}><Path d="M12 20V10M18 20V4M6 20v-4" /></Svg>}
          label={tr("Estatísticas")}
          onPress={() => go(() => navigation.navigate("Stats", { handle: user?.handle ?? "" }))}
        />
        <Row
          icon={<Svg width={18} height={18} viewBox="0 0 24 24" {...stroke(colors.textMuted)}><Circle cx={12} cy={8} r={6} /><Path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11" /></Svg>}
          label={tr("Conquistas")}
          onPress={() => go(() => navigation.navigate("Achievements", { handle: user?.handle ?? "" }))}
        />
        <Row
          icon={<Svg width={18} height={18} viewBox="0 0 24 24" {...stroke(colors.textMuted)}><Circle cx={12} cy={12} r={3} /><Circle cx={12} cy={12} r={8} /><Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></Svg>}
          label={tr("Bolha")}
          onPress={() => go(() => navigation.navigate("Bubble"))}
        />
        <Row
          icon={<Svg width={18} height={18} viewBox="0 0 24 24" {...stroke(colors.textMuted)}><Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></Svg>}
          label={tr("CriticsFM")}
          onPress={() => go(() => navigation.navigate("CriticsFM"))}
        />
        <Row
          icon={<Svg width={18} height={18} viewBox="0 0 24 24" {...stroke(colors.textMuted)}><Path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z" /><Path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></Svg>}
          label={tr("Eventos")}
          onPress={() => go(() => navigation.navigate("Events"))}
        />

        <Divider />

        <Row
          icon={<Svg width={18} height={18} viewBox="0 0 24 24" {...stroke(colors.textMuted)}><Circle cx={12} cy={12} r={3} /><Path d="M12 3v2M12 19v2M4.5 7.5l1.7 1M17.8 15.5l1.7 1M4.5 16.5l1.7-1M17.8 8.5l1.7-1" /></Svg>}
          label={tr("Configurações")}
          onPress={() => go(() => navigation.navigate("Settings"))}
        />
        <Row
          icon={<Svg width={18} height={18} viewBox="0 0 24 24" {...stroke(colors.downFg)}><Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><Path d="M16 17l5-5-5-5M21 12H9" /></Svg>}
          label={tr("Sair")}
          danger
          onPress={() => go(() => signOut())}
        />
    </SheetScaffold>
  );
}
