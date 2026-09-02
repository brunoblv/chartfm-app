import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { BackHeader } from "../components/BackHeader";
import { PillButton } from "../components/PillButton";
import { RootStackParamList } from "../navigation/RootNavigator";
import {
  useLastfmStatusQuery,
  useConnectLastfmMutation,
  useLastfmImportMutation,
  lastfmErrorMessage,
  LastfmImportSong,
} from "../api/lastfm";
import type { ChartSong } from "../data/mock";
import { resolveMediaUrl } from "../lib/api";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PERIOD_OPTIONS = [
  { id: "7days" as const, label: "Últimos 7 dias" },
  { id: "30days" as const, label: "Últimos 30 dias" },
];

function songToChartSong(s: LastfmImportSong, seed: number): ChartSong {
  return {
    t: s.title,
    a: s.artist,
    album: s.album,
    spotifyId: s.spotifyId,
    cover: { palette: ["#1D1D1F", "#5B5B60"], seed, imageUrl: s.imageUrl ?? undefined },
  };
}

export function LastfmScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { setChart } = useAppState();
  const statusQuery = useLastfmStatusQuery();
  const connectMutation = useConnectLastfmMutation();
  const importMutation = useLastfmImportMutation();
  const [step, setStep] = useState(0);
  const [period, setPeriod] = useState<"7days" | "30days">("7days");

  useEffect(() => {
    if (statusQuery.data?.connected && step === 0) setStep(1);
  }, [statusQuery.data?.connected]);

  const importedSongs = importMutation.data?.songs ?? [];
  const ctaLabel = step === 0 ? "Conectar conta" : step === 1 ? "Buscar minhas músicas" : "Criar meu Chart";
  const ctaLoading = connectMutation.isPending || importMutation.isPending;

  const onCta = () => {
    if (step === 0) {
      connectMutation.mutate(undefined, {
        onSuccess: () => setStep(1),
        onError: (e) => {
          const msg = lastfmErrorMessage(e);
          if (msg !== "Conexão cancelada.") Alert.alert("Não foi possível conectar", msg);
        },
      });
    } else if (step === 1) {
      importMutation.mutate(period, {
        onSuccess: () => setStep(2),
        onError: (e) => Alert.alert("Não foi possível importar", lastfmErrorMessage(e)),
      });
    } else {
      setChart(importedSongs.map(songToChartSong));
      navigation.navigate("Editor");
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Importar do Last.fm" />

      <View style={{ flexDirection: "row", gap: 6, paddingHorizontal: 20, paddingBottom: 22 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: step >= i ? colors.accent : colors.fillSubtle }} />
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        {step === 0 && (
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 18, padding: 24, alignItems: "center" }}>
              <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: colors.fillSubtle, borderWidth: 1, borderColor: colors.dividerStrong, borderStyle: "dashed", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <Text style={{ fontWeight: "700", fontSize: 14, color: colors.textMuted }}>last.fm</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text, textAlign: "center" }}>
                Conecte sua conta
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textMuted, textAlign: "center", marginTop: 10 }}>
                Lemos apenas seu histórico de scrobbles para montar a parada. Você confirma tudo antes de publicar.
              </Text>
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>Escolha o período</Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 8, marginBottom: 20 }}>
              Conectado como <Text style={{ fontWeight: "700", color: colors.text }}>{statusQuery.data?.username ?? "…"}</Text>
            </Text>
            <View style={{ gap: 9 }}>
              {PERIOD_OPTIONS.map((p) => {
                const active = p.id === period;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setPeriod(p.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      backgroundColor: active ? colors.accentTint : colors.surface,
                      borderWidth: 1,
                      borderColor: active ? colors.accent : colors.divider,
                      borderRadius: 14,
                      padding: 15,
                    }}
                  >
                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: active ? colors.accent : colors.dividerStrong, alignItems: "center", justifyContent: "center" }}>
                      {active && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />}
                    </View>
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: colors.text }}>{p.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>Seu Top</Text>
              <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 8 }}>
                {importedSongs.length} músicas encontradas ({importMutation.data?.periodLabel}). Você pode reordenar depois.
              </Text>
            </View>
            <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
              {importedSongs.map((s, i) => (
                <View
                  key={`${s.title}-${i}`}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderBottomWidth: i === importedSongs.length - 1 ? 0 : 1, borderBottomColor: colors.dividerSoft }}
                >
                  <Text style={{ width: 22, fontSize: 14, fontWeight: "800", color: colors.text }}>{i + 1}</Text>
                  {s.imageUrl ? (
                    <Image source={{ uri: resolveMediaUrl(s.imageUrl) }} style={{ width: 40, height: 40, borderRadius: 9 }} />
                  ) : (
                    <View style={{ width: 40, height: 40, borderRadius: 9, backgroundColor: colors.fillSubtle }} />
                  )}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text }}>
                      {s.title}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted }}>
                      {s.artist}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 16 + insets.bottom, backgroundColor: colors.bgTopbar, borderTopWidth: 0.5, borderTopColor: colors.divider }}>
        <PillButton label={ctaLabel} onPress={onCta} loading={ctaLoading} />
      </View>
    </SafeAreaView>
  );
}
