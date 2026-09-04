import React, { useState } from "react";
import { View, Text, Pressable, Alert, Linking } from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { AuthField } from "../components/AuthField";
import { PillButton } from "../components/PillButton";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useAuth } from "../state/AuthContext";
import { API_BASE_URL } from "../lib/api";

type Props = NativeStackScreenProps<RootStackParamList, "Cadastro">;

const SIGNUP_ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Preencha nome, email e senha.",
  weak_password: "A senha precisa ter pelo menos 8 caracteres.",
  email_taken: "Já existe uma conta com esse email.",
  google_account: "Esse email já está associado a uma conta Google. Entre com o Google.",
  rate_limited: "Muitas tentativas. Tente novamente em alguns minutos.",
  network_error: "Não foi possível conectar. Verifique sua internet.",
};

export function SignupScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (isLoading) return;
    if (!name || !email || !password) {
      Alert.alert("Não foi possível criar a conta", SIGNUP_ERROR_MESSAGES.missing_fields);
      return;
    }
    setIsLoading(true);
    try {
      const result = await register(name, email, password);
      if (result.ok) {
        Alert.alert(
          "Confirme seu email",
          "Enviamos um link de confirmação para o seu email. Confirme para poder entrar.",
          [{ text: "OK", onPress: () => navigation.replace("Login") }]
        );
      } else {
        Alert.alert("Não foi possível criar a conta", SIGNUP_ERROR_MESSAGES[result.error ?? ""] ?? "Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 28 }}>
        <View style={{ paddingVertical: 16 }}>
          <Pressable
            onPress={() => navigation.navigate("Login")}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
          >
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round">
              <Path d="M15 18l-6-6 6-6" />
            </Svg>
          </Pressable>
        </View>

        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={{ fontSize: 26, fontWeight: "800", letterSpacing: -0.6, color: colors.text, marginBottom: 4 }}>
            Criar conta
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 26 }}>Leva menos de um minuto</Text>

          <View style={{ gap: 12 }}>
            <AuthField label="Nome" value={name} onChangeText={setName} placeholder="Bruno" />
            <AuthField label="Email" value={email} onChangeText={setEmail} placeholder="bruno@exemplo.com" />
            <AuthField label="Senha" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
          </View>

          <PillButton label="Criar conta" style={{ marginTop: 22 }} onPress={handleSignup} loading={isLoading} />

          <Text style={{ fontSize: 11.5, color: colors.textDisabled, textAlign: "center", marginTop: 14, lineHeight: 17 }}>
            Ao continuar, você aceita os{" "}
            <Text
              onPress={() => Linking.openURL(`${API_BASE_URL}/terms-of-use`)}
              style={{ color: colors.accent, fontWeight: "600" }}
            >
              Termos
            </Text>
            {" "}e a{" "}
            <Text
              onPress={() => Linking.openURL(`${API_BASE_URL}/privacy-policy`)}
              style={{ color: colors.accent, fontWeight: "600" }}
            >
              Política de Privacidade
            </Text>
            .
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
