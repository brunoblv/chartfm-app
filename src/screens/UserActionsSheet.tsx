import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useBlockMutation, useMuteMutation } from "../api/profile";
import { SheetScaffold } from "../components/SheetScaffold";

type Route = RouteProp<RootStackParamList, "UserActionsSheet">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Folha de segurança aberta a partir do perfil de outra pessoa (ou de um item
 * de feed): silenciar, bloquear, denunciar. Mesmo esqueleto de
 * ProfileSheetScreen/CreateSheetScreen.
 */
export function UserActionsSheet() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { userId, handle, initialMuted } = route.params;
  const blockMutation = useBlockMutation();
  const muteMutation = useMuteMutation();
  const [muted, setMuted] = React.useState(Boolean(initialMuted));

  const stroke = (color: string) => ({
    fill: "none" as const,
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  });

  const Row = ({
    icon,
    label,
    onPress,
    danger,
    disabled,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    danger?: boolean;
    disabled?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 20, opacity: disabled ? 0.5 : 1 }}
    >
      <View style={{ width: 18 }}>{icon}</View>
      <Text style={{ fontSize: 15, fontWeight: "600", color: danger ? colors.downFg : colors.text }}>{label}</Text>
    </Pressable>
  );

  const Divider = () => <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: 6 }} />;

  const handleMute = () => {
    muteMutation.mutate(userId, {
      onSuccess: (data) => setMuted(data.muted),
      onError: () => Alert.alert("Não foi possível concluir", "Tente novamente."),
    });
  };

  const handleBlock = () => {
    Alert.alert(
      "Bloquear @" + handle,
      "Vocês não vão mais se encontrar no ChartFM, e o follow entre vocês será desfeito.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Bloquear",
          style: "destructive",
          onPress: () =>
            blockMutation.mutate(userId, {
              onSuccess: () => navigation.goBack(),
              onError: () => Alert.alert("Não foi possível bloquear", "Tente novamente."),
            }),
        },
      ],
    );
  };

  const handleReport = () => {
    navigation.replace("ReportSheet", { targetType: "user", targetId: userId, label: `@${handle}` });
  };

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
        maxHeight: "60%",
      }}
    >
        <View style={{ alignItems: "center", paddingVertical: 10 }}>
          <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: colors.dividerStrong }} />
        </View>

        <Row
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24" {...stroke(colors.textMuted)}>
              {muted ? (
                <>
                  <Path d="M1 1l22 22" />
                  <Path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                </>
              ) : (
                <>
                  <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <Circle cx={12} cy={12} r={3} />
                </>
              )}
            </Svg>
          }
          label={muted ? "Deixar de silenciar" : "Silenciar"}
          onPress={handleMute}
          disabled={muteMutation.isPending}
        />
        <Row
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24" {...stroke(colors.downFg)}>
              <Circle cx={12} cy={12} r={9} />
              <Path d="M5.5 5.5l13 13" />
            </Svg>
          }
          label="Bloquear"
          danger
          onPress={handleBlock}
          disabled={blockMutation.isPending}
        />
        <Divider />
        <Row
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24" {...stroke(colors.textMuted)}>
              <Path d="M4 21V4a1 1 0 0 1 1-1h10l4 4v9.5a1 1 0 0 1-1 1H8l-4 3.5z" />
            </Svg>
          }
          label="Denunciar"
          onPress={handleReport}
        />
    </SheetScaffold>
  );
}
