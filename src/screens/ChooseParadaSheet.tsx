import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAppState } from "../state/AppState";
import { useParadasQuery } from "../api/paradas";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList, "ChooseParada">;
type Route = RouteProp<RootStackParamList, "ChooseParada">;

/**
 * Porta de entrada do fluxo de montar/atualizar parada. Com mais de uma, a
 * pessoa escolhe qual. Com uma só (ou nenhuma), segue na hora para o próximo
 * passo, sem tela extra.
 */
export function ChooseParadaSheet() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const next = useRoute<Route>().params.next;
  const { paradaId, setParadaId, setChart } = useAppState();
  const paradasQuery = useParadasQuery();
  const paradas = paradasQuery.data?.paradas ?? [];
  const advanced = useRef(false);

  const goNext = (id: string | null) => {
    if (advanced.current) return;
    advanced.current = true;
    if (id && id !== paradaId) setChart([]);
    setParadaId(id);
    navigation.replace(next);
  };

  useEffect(() => {
    if (paradasQuery.isLoading) return;
    if (paradasQuery.isError) {
      goNext(paradaId);
      return;
    }
    if (!paradasQuery.data) return;
    if (paradas.length <= 1) {
      goNext(paradas[0]?.id ?? null);
    }
  }, [paradasQuery.isLoading, paradasQuery.isError, paradasQuery.data, paradas.length]);

  const waiting = paradasQuery.isLoading || paradas.length <= 1;

  return (
    <View style={{ flex: 1 }}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} onPress={() => navigation.goBack()} />
      <View
        style={{
          backgroundColor: colors.surfaceElevated,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderTopWidth: 0.5,
          borderTopColor: colors.divider,
          paddingBottom: 16 + insets.bottom,
          maxHeight: "70%",
        }}
      >
        <View style={{ alignItems: "center", paddingVertical: 10 }}>
          <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: colors.dividerStrong }} />
        </View>
        <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.5, color: colors.text, marginHorizontal: 20, marginBottom: 4 }}>
          Qual parada você quer atualizar?
        </Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginHorizontal: 20, marginBottom: 12, lineHeight: 18 }}>
          Cada parada tem a própria lista da semana.
        </Text>

        {waiting ? (
          <ActivityIndicator color={colors.text} style={{ marginVertical: 24 }} />
        ) : (
          <ScrollView>
            {paradas.map((p) => {
              const selected = p.id === paradaId;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => goNext(p.id)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 20 }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 1.6,
                      borderColor: selected ? colors.accent : colors.dividerStrong,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selected ? <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.accent }} /> : null}
                  </View>
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: colors.text }}>{p.name}</Text>
                  {p.isPrimary ? (
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>principal</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
