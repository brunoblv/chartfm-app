import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { ChartFMLogo } from "../components/ChartFMLogo";
import { AuthField } from "../components/AuthField";
import { PillButton } from "../components/PillButton";
import { SocialIcon } from "../components/SocialIcon";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useAuth } from "../state/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  cancelled: "Login cancelado.",
  email_not_verified: "Sua conta Google precisa ter o email verificado.",
  google_not_configured: "Login com Google indisponível no momento.",
};

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Preencha email e senha.",
  invalid_credentials: "Email ou senha incorretos.",
  email_not_verified: "Confirme seu email antes de entrar.",
  rate_limited: "Muitas tentativas. Tente novamente em alguns minutos.",
  network_error: "Não foi possível conectar. Verifique sua internet.",
};

export function LoginScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { signInWithGoogle, signInWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.ok) {
        navigation.replace("Main");
      } else if (result.error !== "cancelled") {
        Alert.alert("Não foi possível entrar", GOOGLE_ERROR_MESSAGES[result.error ?? ""] ?? "Tente novamente.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (isLoginLoading) return;
    if (!email || !password) {
      Alert.alert("Não foi possível entrar", LOGIN_ERROR_MESSAGES.missing_fields);
      return;
    }
    setIsLoginLoading(true);
    try {
      const result = await signInWithPassword(email, password);
      if (result.ok) {
        navigation.replace("Main");
      } else {
        Alert.alert("Não foi possível entrar", LOGIN_ERROR_MESSAGES[result.error ?? ""] ?? "Tente novamente.");
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 28 }}>
        <View style={{ paddingVertical: 16 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
          >
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round">
              <Path d="M15 18l-6-6 6-6" />
            </Svg>
          </Pressable>
        </View>

        <View style={{ flex: 1, justifyContent: "center" }}>
          <ChartFMLogo size={40} />
          <Text style={{ fontSize: 26, fontWeight: "800", letterSpacing: -0.6, color: colors.text, marginTop: 18, marginBottom: 4 }}>
            Entrar
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 26 }}>Continue de onde parou</Text>

          <View style={{ gap: 12 }}>
            <AuthField label="Email" value={email} onChangeText={setEmail} placeholder="voce@exemplo.com" />
            <AuthField label="Senha" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
          </View>

          <Pressable style={{ alignSelf: "flex-end", marginTop: 10 }}>
            <Text style={{ fontSize: 13, color: colors.accent, fontWeight: "600" }}>Esqueci minha senha</Text>
          </Pressable>

          <PillButton label="Entrar" style={{ marginTop: 22 }} onPress={handlePasswordLogin} loading={isLoginLoading} />

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 22 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
            <Text style={{ fontSize: 12, color: colors.textMuted }}>ou continue com</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
          </View>

          <Pressable
            onPress={handleGoogleLogin}
            disabled={isGoogleLoading}
            style={{
              flexDirection: "row",
              borderWidth: 1,
              borderColor: colors.dividerStrong,
              borderRadius: 12,
              paddingVertical: 13,
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              opacity: isGoogleLoading ? 0.6 : 1,
            }}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <SocialIcon name="google" size={16} />
                <Text style={{ fontWeight: "700", fontSize: 14, color: colors.text }}>Google</Text>
              </>
            )}
          </Pressable>
        </View>

        <Pressable
          onPress={() => navigation.navigate("Cadastro")}
          hitSlop={12}
          style={{ alignItems: "center", paddingVertical: 14, marginBottom: 12 }}
        >
          <Text style={{ fontSize: 14, color: colors.textMuted }}>
            Não tem conta? <Text style={{ color: colors.accent, fontWeight: "700" }}>Criar conta</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
