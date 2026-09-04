import React from "react";
import { View, Text, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useReportMutation } from "../api/profile";
import { accountErrorMessage } from "../api/account";

const CHILD_SAFETY_REASON_PREFIX = "[child_safety]";

type ReasonId = "child_safety" | "harassment" | "spam" | "other";

const REASONS: { id: ReasonId; label: string }[] = [
  { id: "child_safety", label: "Abuso ou exploração sexual infantil" },
  { id: "harassment", label: "Assédio ou ódio" },
  { id: "spam", label: "Spam ou conta falsa" },
  { id: "other", label: "Outro" },
];

type Route = RouteProp<RootStackParamList, "ReportSheet">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ReportSheet() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { targetType, targetId, label } = route.params;
  const reportMutation = useReportMutation();
  const [reasonId, setReasonId] = React.useState<ReasonId | null>(null);
  const [details, setDetails] = React.useState("");
  const [sent, setSent] = React.useState(false);

  const buildReason = (): string | null => {
    if (!reasonId) return null;
    const item = REASONS.find((r) => r.id === reasonId)!;
    const extra = details.trim();
    if (reasonId === "child_safety") {
      return extra
        ? `${CHILD_SAFETY_REASON_PREFIX} ${item.label}. ${extra}`
        : `${CHILD_SAFETY_REASON_PREFIX} ${item.label}`;
    }
    if (reasonId === "other") return extra || null;
    return extra ? `${item.label}. ${extra}` : item.label;
  };

  const submit = () => {
    if (!reasonId) {
      Alert.alert("Escolha um motivo", "Selecione o tipo de denúncia.");
      return;
    }
    const reason = buildReason();
    if (!reason || reason.length < 5) {
      Alert.alert("Motivo muito curto", "Escreva um motivo com pelo menos 5 caracteres.");
      return;
    }
    reportMutation.mutate(
      { targetType: targetType === "user" ? "USER" : "POST", targetId, reason },
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
          {targetType === "user" ? `Denunciar ${label ?? "perfil"}` : "Denunciar publicação"}
        </Text>

        {sent ? (
          <Text style={{ fontSize: 14, color: colors.textSubtle, marginTop: 12 }}>
            Denúncia enviada. Nossa equipe vai analisar.
          </Text>
        ) : (
          <>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6, marginBottom: 12 }}>
              Escolha o motivo. Isso ajuda a moderação a analisar o caso.
            </Text>
            <View style={{ gap: 8, marginBottom: 12 }}>
              {REASONS.map((r) => {
                const active = reasonId === r.id;
                const danger = r.id === "child_safety";
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => setReasonId(r.id)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: active
                        ? danger
                          ? colors.downFg
                          : colors.accent
                        : colors.divider,
                      backgroundColor: active
                        ? danger
                          ? "rgba(229, 72, 77, 0.10)"
                          : colors.fillSubtle
                        : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13.5,
                        fontWeight: "600",
                        color: danger ? colors.downFg : colors.text,
                      }}
                    >
                      {r.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>
              {reasonId === "child_safety"
                ? "Se puder, descreva o que viu. Não envie imagens do conteúdo."
                : "Detalhes"}
            </Text>
            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="O que está acontecendo?"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              style={{
                borderWidth: 1,
                borderColor: colors.divider,
                borderRadius: 12,
                padding: 12,
                minHeight: 88,
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
