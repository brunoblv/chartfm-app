import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { AuthField } from "../components/AuthField";
import { PillButton } from "../components/PillButton";
import { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Cadastro">;

export function SignupScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

          <PillButton label="Criar conta" style={{ marginTop: 22 }} onPress={() => navigation.replace("Main")} />

          <Text style={{ fontSize: 11.5, color: colors.textDisabled, textAlign: "center", marginTop: 14, lineHeight: 17 }}>
            Ao continuar, você aceita os Termos e a Política de Privacidade.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
