import React from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme, ThemePreference } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { Toggle } from "../components/Toggle";

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: "row", gap: 6, marginTop: 11, backgroundColor: colors.fillInset, padding: 3, borderRadius: 11 }}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 9,
              borderRadius: 9,
              backgroundColor: active ? colors.surfaceElevated : "transparent",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: active ? colors.text : colors.textMuted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  const { colors } = useAppTheme();
  return (
    <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: colors.textMuted, paddingHorizontal: 20, paddingBottom: 8 }}>
      {children}
    </Text>
  );
}

export function SettingsScreen() {
  const { colors, preference, setPreference, lang, setLang } = useAppTheme();
  const { notifPrefs, toggleNotifPref, isPublicProfile, setIsPublicProfile, isOffline, setIsOffline } = useAppState();

  return (
    <Screen>
      <BackHeader title="Configurações" />

      <View style={{ marginHorizontal: 16, marginBottom: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 14 }}>
        <LinearGradient colors={[colors.gradientHero[0], colors.gradientHero[1]]} style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 19 }}>B</Text>
        </LinearGradient>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>Bruno</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 1 }}>bruno@exemplo.com</Text>
        </View>
        <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "700" }}>Editar</Text>
      </View>

      <SectionLabel>Aparência</SectionLabel>
      <View style={{ marginHorizontal: 16, marginBottom: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
        <View style={{ padding: 14 }}>
          <Text style={{ fontSize: 14.5, fontWeight: "600", color: colors.text }}>Tema</Text>
          <SegmentedControl<ThemePreference>
            value={preference}
            onChange={setPreference}
            options={[
              { id: "system", label: "Sistema" },
              { id: "light", label: "Claro" },
              { id: "dark", label: "Escuro" },
            ]}
          />
        </View>
        <View style={{ borderTopWidth: 1, borderTopColor: colors.dividerSoft, padding: 14 }}>
          <Text style={{ fontSize: 14.5, fontWeight: "600", color: colors.text }}>Idioma</Text>
          <SegmentedControl
            value={lang}
            onChange={setLang}
            options={[
              { id: "pt", label: "Português" },
              { id: "en", label: "English" },
            ]}
          />
        </View>
      </View>

      <SectionLabel>Notificações</SectionLabel>
      <View style={{ marginHorizontal: 16, marginBottom: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
        {notifPrefs.map((p, i) => (
          <View
            key={p.id}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: i === notifPrefs.length - 1 ? 0 : 1, borderBottomColor: colors.dividerSoft }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14.5, fontWeight: "600", color: colors.text }}>{p.label}</Text>
              <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>{p.note}</Text>
            </View>
            <Toggle on={p.on} onToggle={() => toggleNotifPref(p.id)} />
          </View>
        ))}
      </View>

      <SectionLabel>Contas conectadas</SectionLabel>
      <View style={{ marginHorizontal: 16, marginBottom: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.dividerSoft }}>
          <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: colors.fillSubtle, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontWeight: "700", fontSize: 10.5, color: colors.textMuted }}>last.fm</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 14.5, fontWeight: "600", color: colors.text }}>Last.fm</Text>
            <Text style={{ fontSize: 11.5, color: colors.upFg, marginTop: 2 }}>Conectado como brunoblv</Text>
          </View>
          <Text style={{ fontSize: 12.5, color: colors.textMuted, fontWeight: "600" }}>Desconectar</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}>
          <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: colors.fillSubtle, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontWeight: "700", fontSize: 10.5, color: colors.textMuted }}>SPFY</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 14.5, fontWeight: "600", color: colors.text }}>Spotify</Text>
            <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>Não conectado</Text>
          </View>
          <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "700" }}>Conectar</Text>
        </View>
      </View>

      <SectionLabel>Privacidade</SectionLabel>
      <View style={{ marginHorizontal: 16, marginBottom: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.dividerSoft }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 14.5, fontWeight: "600", color: colors.text }}>Perfil público</Text>
            <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>Qualquer pessoa vê suas paradas</Text>
          </View>
          <Toggle on={isPublicProfile} onToggle={() => setIsPublicProfile(!isPublicProfile)} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 14 }}>
          <Text style={{ flex: 1, fontSize: 14.5, fontWeight: "600", color: colors.text }}>Baixar meus dados</Text>
        </View>
      </View>

      <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
        <Text style={{ padding: 14, fontSize: 14.5, fontWeight: "600", color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.dividerSoft }}>
          Ajuda e suporte
        </Text>
        <Text style={{ padding: 14, fontSize: 14.5, fontWeight: "600", color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.dividerSoft }}>
          Termos e privacidade
        </Text>
        <Text style={{ padding: 14, fontSize: 14.5, fontWeight: "600", color: colors.accent }}>Sair da conta</Text>
      </View>

      <SectionLabel>Simulação</SectionLabel>
      <View style={{ marginHorizontal: 16, marginBottom: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 14.5, fontWeight: "600", color: colors.text }}>Modo offline</Text>
            <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>Mostra a Home com dados salvos e ações pausadas</Text>
          </View>
          <Toggle on={isOffline} onToggle={() => setIsOffline(!isOffline)} />
        </View>
      </View>

      <Text style={{ textAlign: "center", fontSize: 11.5, color: colors.textDisabled, paddingTop: 22 }}>ChartFM 1.0 (240)</Text>
    </Screen>
  );
}
