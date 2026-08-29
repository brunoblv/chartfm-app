import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { ChartFMLogo } from "../components/ChartFMLogo";
import { AuthField } from "../components/AuthField";
import { PillButton } from "../components/PillButton";
import { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [email, setEmail] = useState("bruno@exemplo.com");
  const [password, setPassword] = useState("••••••••");

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
            <AuthField label="Email" value={email} onChangeText={setEmail} />
            <AuthField label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <Pressable style={{ alignSelf: "flex-end", marginTop: 10 }}>
            <Text style={{ fontSize: 13, color: colors.accent, fontWeight: "600" }}>Esqueci minha senha</Text>
          </Pressable>

          <PillButton label="Entrar" style={{ marginTop: 22 }} onPress={() => navigation.replace("Main")} />

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 22 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
            <Text style={{ fontSize: 12, color: colors.textMuted }}>ou continue com</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
          </View>

          <View style={{ borderWidth: 1, borderColor: colors.dividerStrong, borderRadius: 12, paddingVertical: 13, alignItems: "center" }}>
            <Text style={{ fontWeight: "700", fontSize: 14, color: colors.text }}>Google</Text>
          </View>
        </View>

        <Pressable onPress={() => navigation.navigate("Cadastro")} style={{ alignItems: "center", paddingBottom: 8 }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>
            Não tem conta? <Text style={{ color: colors.accent, fontWeight: "700" }}>Criar conta</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
