import React from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme, ThemePreference } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { useAuth } from "../state/AuthContext";
import { useLastfmStatusQuery } from "../api/lastfm";
import { useNotificationPrefsQuery, useUpdateNotificationPrefsMutation, NotifPrefCategory } from "../api/notificationPrefs";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { Toggle } from "../components/Toggle";
import { SocialIcon } from "../components/SocialIcon";
import { RootStackParamList } from "../navigation/RootNavigator";

const NOTIF_ROWS: { category: NotifPrefCategory | null; label: string; note: string }[] = [
  { category: "chart", label: "Minha parada", note: "Lembrete semanal de atualizar" },
  { category: null, label: "Ranking", note: "Em breve" },
  { category: null, label: "Eventos", note: "Em breve" },
  { category: "social", label: "Comunidade", note: "Seguidores, curtidas e comentários" },
  { category: null, label: "Conquistas", note: "Em breve" },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

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
  const { isPublicProfile, setIsPublicProfile, isOffline } = useAppState();
  const { user, signOut } = useAuth();
  const navigation = useNavigation<Nav>();
  const lastfmStatus = useLastfmStatusQuery();
  const notifPrefsQuery = useNotificationPrefsQuery();
  const updateNotifPrefs = useUpdateNotificationPrefsMutation();

  const handleSignOut = async () => {
    await signOut();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "Onboarding" }] })
    );
  };

  return (
    <Screen>
      <BackHeader title="Configurações" />

      <View style={{ marginHorizontal: 16, marginBottom: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 14 }}>
        <LinearGradient colors={[colors.gradientHero[0], colors.gradientHero[1]]} style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 19 }}>{(user?.name ?? user?.handle ?? "?").charAt(0).toUpperCase()}</Text>
        </LinearGradient>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>{user?.name ?? user?.handle ?? "—"}</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 1 }}>{user?.email ?? ""}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate("EditProfile")}>
          <Text style={{ fontSize: 12.5, color: colors.accent, fontWeight: "700" }}>Editar</Text>
        </Pressable>
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
        {NOTIF_ROWS.map((row, i) => {
          const enabled = row.category ? notifPrefsQuery.data?.prefs[row.category] ?? true : false;
          return (
            <View
              key={row.label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
                borderBottomWidth: i === NOTIF_ROWS.length - 1 ? 0 : 1,
                borderBottomColor: colors.dividerSoft,
                opacity: row.category ? 1 : 0.5,
              }}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 14.5, fontWeight: "600", color: colors.text }}>{row.label}</Text>
                <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>{row.note}</Text>
              </View>
              <Toggle
                on={row.category ? enabled : false}
                onToggle={
                  row.category
                    ? () => updateNotifPrefs.mutate({ [row.category as NotifPrefCategory]: !enabled })
                    : () => {}
                }
              />
            </View>
          );
        })}
      </View>

      <SectionLabel>Contas conectadas</SectionLabel>
      <View style={{ marginHorizontal: 16, marginBottom: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.dividerSoft }}>
          <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: colors.fillSubtle, alignItems: "center", justifyContent: "center" }}>
            <SocialIcon name="lastfm" size={19} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 14.5, fontWeight: "600", color: colors.text }}>Last.fm</Text>
            <Text style={{ fontSize: 11.5, color: lastfmStatus.data?.connected ? colors.upFg : colors.textMuted, marginTop: 2 }}>
              {lastfmStatus.data?.connected ? `Conectado como ${lastfmStatus.data.username}` : "Não conectado"}
            </Text>
          </View>
          {lastfmStatus.data?.connected && (
            <Text style={{ fontSize: 12.5, color: colors.textMuted, fontWeight: "600" }}>Desconectar</Text>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}>
          <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: colors.fillSubtle, alignItems: "center", justifyContent: "center" }}>
            <SocialIcon name="spotify" size={19} />
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
        <Pressable onPress={handleSignOut}>
          <Text style={{ padding: 14, fontSize: 14.5, fontWeight: "600", color: colors.accent }}>Sair da conta</Text>
        </Pressable>
      </View>

      {isOffline && (
        <View style={{ marginHorizontal: 16, marginBottom: 20, backgroundColor: colors.fillSubtle, borderRadius: 14, padding: 14 }}>
          <Text style={{ fontSize: 12.5, color: colors.textSubtle }}>Sem conexão com a internet no momento.</Text>
        </View>
      )}

      <Text style={{ textAlign: "center", fontSize: 11.5, color: colors.textDisabled, paddingTop: 22 }}>ChartFM 1.0 (240)</Text>
    </Screen>
  );
}
