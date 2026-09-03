import React from "react";
import { View, Text, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useReportMutation } from "../api/profile";
import { accountErrorMessage } from "../api/account";

type Route = RouteProp<RootStackParamList, "ReportSheet">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ReportSheet() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { targetType, targetId, label } = route.params;
  const reportMutation = useReportMutation();
  const [reason, setReason] = React.useState("");
  const [sent, setSent] = React.useState(false);

  const submit = () => {
    if (reason.trim().length < 5) {
      Alert.alert("Motivo muito curto", "Escreva um motivo com pelo menos 5 caracteres.");
      return;
    }
    reportMutation.mutate(
      { targetType: targetType === "user" ? "USER" : "POST", targetId, reason: reason.trim() },
      {
        onSuccess: () => setSent(true),
        onError: (e) => Alert.alert("Não foi possível enviar", accountErrorMessage(e)),
      },
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} onPress={() => navigation.goBack()} />
      <View
        style={{
          backgroundColor: colors.surfaceElevated,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderTopWidth: 0.5,
          borderTopColor: colors.divider,
          padding: 20,
          paddingBottom: 28,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 6 }}>
          <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: colors.dividerStrong }} />
        </View>

        <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text, marginTop: 12 }}>
          {targetType === "user" ? `Denunciar ${label ?? "perfil"}` : "Denunciar post"}
        </Text>

        {sent ? (
          <Text style={{ fontSize: 14, color: colors.textSubtle, marginTop: 12 }}>
            Denúncia enviada. Nossa equipe vai analisar.
          </Text>
        ) : (
          <>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6, marginBottom: 12 }}>
              Descreva o motivo da denúncia. Isso ajuda a moderação a analisar o caso.
            </Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="O que está acontecendo?"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              style={{
                borderWidth: 1,
                borderColor: colors.divider,
                borderRadius: 12,
                padding: 12,
                minHeight: 100,
                fontSize: 14,
                color: colors.text,
                textAlignVertical: "top",
              }}
            />
            <Pressable
              onPress={submit}
              disabled={reportMutation.isPending}
              style={{
                backgroundColor: colors.accent,
                borderRadius: 100,
                paddingVertical: 13,
                alignItems: "center",
                marginTop: 16,
                opacity: reportMutation.isPending ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14.5 }}>Enviar denúncia</Text>
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
