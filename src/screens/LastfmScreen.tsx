import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { BackHeader } from "../components/BackHeader";
import { PillButton } from "../components/PillButton";
import { SocialIcon } from "../components/SocialIcon";
import { RootStackParamList } from "../navigation/RootNavigator";
import {
  useLastfmStatusQuery,
  useConnectLastfmMutation,
  useLastfmImportMutation,
  lastfmErrorMessage,
  LastfmImportSong,
  LastfmImportPeriod,
} from "../api/lastfm";
import { useParadasQuery } from "../api/paradas";
import type { ChartSong } from "../data/mock";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PERIOD_OPTIONS: { id: LastfmImportPeriod; label: string; desc: string }[] = [
  {
    id: "7days",
    label: "Últimos 7 dias",
    desc: "Suas músicas dos últimos 7 dias serão importadas, ordenadas por plays.",
  },
  {
    id: "30days",
    label: "Últimos 30 dias",
    desc: "Suas músicas dos últimos 30 dias serão importadas, ordenadas por plays.",
  },
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

function CountSlider({
  value,
  min,
  max,
  onChange,
  disabled,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();
  const trackRef = useRef<View>(null);
  const trackWidth = useRef(1);
  const trackPageX = useRef(0);
  const [width, setWidth] = useState(0);
  const ratio = (value - min) / Math.max(1, max - min);
  const thumb = 20;
  const left = width <= thumb ? 0 : ratio * (width - thumb);

  const measureTrack = (layoutWidth?: number) => {
    if (layoutWidth && layoutWidth > 0) {
      setWidth(layoutWidth);
      trackWidth.current = layoutWidth;
    }
    trackRef.current?.measureInWindow((x, _y, w) => {
      trackPageX.current = x;
      if (w > 0) {
        trackWidth.current = w;
        setWidth(w);
      }
    });
  };

  const setFromPageX = (pageX: number) => {
    const t = Math.max(0, Math.min(1, (pageX - trackPageX.current) / trackWidth.current));
    onChange(Math.round(min + t * (max - min)));
  };

  return (
    <View
      ref={trackRef}
      collapsable={false}
      onLayout={(e) => measureTrack(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => !disabled}
      onMoveShouldSetResponder={() => !disabled}
      onResponderGrant={(e) => setFromPageX(e.nativeEvent.pageX)}
      onResponderMove={(e) => setFromPageX(e.nativeEvent.pageX)}
      style={{ height: 28, justifyContent: "center", opacity: disabled ? 0.45 : 1 }}
      accessibilityRole="adjustable"
      accessibilityValue={{ min, max, now: value }}
    >
      <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.fillSubtle }}>
        <View style={{ width: `${ratio * 100}%`, height: 4, borderRadius: 2, backgroundColor: colors.accent }} />
      </View>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left,
          width: thumb,
          height: thumb,
          borderRadius: thumb / 2,
          backgroundColor: colors.accent,
          borderWidth: 2,
          borderColor: "#fff",
        }}
      />
    </View>
  );
}

export function LastfmScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { setChart, paradaId, weekDate } = useAppState();
  const statusQuery = useLastfmStatusQuery();
  const paradasQuery = useParadasQuery();
  const connectMutation = useConnectLastfmMutation();
  const importMutation = useLastfmImportMutation();
  const [period, setPeriod] = useState<LastfmImportPeriod>("7days");
  const [importCount, setImportCount] = useState(200);
  const countInited = useRef(false);

  const selectedParada =
    paradasQuery.data?.paradas.find((p) => p.id === paradaId) ??
    paradasQuery.data?.paradas.find((p) => p.isPrimary) ??
    paradasQuery.data?.paradas[0];
  const chartSize =
    selectedParada?.chartSize && selectedParada.chartSize > 0
      ? Math.min(200, selectedParada.chartSize)
      : null;

  useEffect(() => {
    if (countInited.current || chartSize == null) return;
    setImportCount(chartSize);
    countInited.current = true;
  }, [chartSize]);

  const connected = Boolean(statusQuery.data?.connected);
  const periodMeta = PERIOD_OPTIONS.find((p) => p.id === period) ?? PERIOD_OPTIONS[0];
  const ctaLoading = connectMutation.isPending || importMutation.isPending;
  const ctaLabel = connected
    ? importCount === 1
      ? "Importar 1 música"
      : `Importar ${importCount} músicas`
    : "Conectar conta";

  const onCta = () => {
    if (!connected) {
      connectMutation.mutate(undefined, {
        onError: (e) => {
          const msg = lastfmErrorMessage(e);
          if (msg !== "Conexão cancelada.") Alert.alert("Não foi possível conectar", msg);
        },
      });
      return;
    }
    importMutation.mutate(
      { period, limit: importCount, weekDate },
      {
        onSuccess: (data) => {
          setChart((data.songs ?? []).map(songToChartSong));
          navigation.navigate("Editor");
        },
        onError: (e) => Alert.alert("Não foi possível importar", lastfmErrorMessage(e)),
      }
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Importar do Last.fm" />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        {statusQuery.isLoading ? (
          <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
        ) : !connected ? (
          <View style={{ paddingHorizontal: 20 }}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.divider,
                borderRadius: 18,
                padding: 24,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  backgroundColor: "#FA243C",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                }}
              >
                <SocialIcon name="lastfm" size={28} color="#fff" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.5, color: colors.text, textAlign: "center" }}>
                Conecte sua conta
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textMuted, textAlign: "center", marginTop: 10 }}>
                Autorize o Last.fm para importar as músicas que você mais ouviu direto na sua parada.
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, gap: 20 }}>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "rgba(250,36,60,0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SocialIcon name="lastfm" size={15} />
                </View>
                <Text style={{ flex: 1, fontSize: 18, fontWeight: "800", letterSpacing: -0.4, color: colors.text }}>
                  Importar do Last.fm ({periodMeta.label.toLowerCase()})
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19 }}>{periodMeta.desc}</Text>
            </View>

            <View
              style={{
                backgroundColor: colors.fillInset,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#FA243C",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SocialIcon name="lastfm" size={15} color="#fff" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "600" }}>Conta Last.fm</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text, marginTop: 1 }}>
                  @{statusQuery.data?.username ?? "…"}
                </Text>
              </View>
            </View>

            <View style={{ gap: 9 }}>
              {PERIOD_OPTIONS.map((p) => {
                const active = p.id === period;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setPeriod(p.id)}
                    disabled={ctaLoading}
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
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        borderWidth: 2,
                        borderColor: active ? colors.accent : colors.dividerStrong,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {active ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} /> : null}
                    </View>
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: colors.text }}>{p.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 10 }}>
                Quantas músicas importar?
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <CountSlider value={importCount} min={1} max={200} onChange={setImportCount} disabled={ctaLoading} />
                </View>
                <View
                  style={{
                    minWidth: 52,
                    alignItems: "center",
                    backgroundColor: colors.accentTint,
                    borderWidth: 1,
                    borderColor: "rgba(250,36,60,0.2)",
                    borderRadius: 8,
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "800", color: colors.accent }}>{importCount}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <Pressable
                  onPress={() => setImportCount((n) => Math.max(1, n - 1))}
                  disabled={ctaLoading || importCount <= 1}
                  hitSlop={8}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: colors.fillInset,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: importCount <= 1 ? 0.4 : 1,
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>−</Text>
                </Pressable>
                <Pressable
                  onPress={() => setImportCount((n) => Math.min(200, n + 1))}
                  disabled={ctaLoading || importCount >= 200}
                  hitSlop={8}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: colors.fillInset,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: importCount >= 200 ? 0.4 : 1,
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>+</Text>
                </Pressable>
              </View>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 8 }}>
                {period === "7days"
                  ? "Máximo de 200 músicas. Período: últimos 7 dias."
                  : "Máximo de 200 músicas. Período: últimos 30 dias."}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: chartSize ? colors.accentTint : colors.fillInset,
                borderWidth: 1,
                borderColor: chartSize ? "rgba(250,36,60,0.15)" : colors.divider,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 14,
                flexDirection: "row",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <View style={{ paddingTop: 1 }}>
                {chartSize ? (
                  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2} strokeLinecap="round">
                    <Path d="M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
                  </Svg>
                ) : (
                  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round">
                    <Path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 8h.01M11 12h1v4h1" />
                  </Svg>
                )}
              </View>
              <View style={{ flex: 1 }}>
                {chartSize ? (
                  <>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                      Sua parada tem {chartSize} {chartSize === 1 ? "posição" : "posições"}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 3, lineHeight: 18 }}>
                      Ao publicar, músicas além da {chartSize}ª posição serão automaticamente descartadas. Importe mais
                      músicas para ter opções e reordene a lista antes de publicar.
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>Tamanho da parada não definido</Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 3, lineHeight: 18 }}>
                      Defina o tamanho da sua parada nas configurações para que o corte seja aplicado automaticamente ao
                      publicar.
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: 16,
          paddingBottom: 16 + insets.bottom,
          backgroundColor: colors.bgTopbar,
          borderTopWidth: 0.5,
          borderTopColor: colors.divider,
        }}
      >
        <PillButton
          label={ctaLabel}
          onPress={onCta}
          loading={ctaLoading || statusQuery.isLoading || (connected && paradasQuery.isLoading)}
          disabled={statusQuery.isLoading || (connected && paradasQuery.isLoading) || (!connected && !statusQuery.data)}
        />
      </View>
    </SafeAreaView>
  );
}
