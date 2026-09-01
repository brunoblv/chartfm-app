import React from "react";
import { View, Text, Pressable, ActivityIndicator, Image, FlatList } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useAppTheme } from "../theme/ThemeProvider";
import { useUserParadasQuery, ParadaCard } from "../api/profile";
import { resolveMediaUrl } from "../lib/api";
import { RootStackParamList } from "../navigation/RootNavigator";

type Route = RouteProp<RootStackParamList, "ParadasList">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

function ParadaCardItem({ parada, handle, navigation }: { parada: ParadaCard; handle: string; navigation: Nav }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={() => navigation.navigate("ParadaDetail", { handle, paradaId: parada.id, paradaName: parada.name })}
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 16,
        padding: 16,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {parada.logo ? (
          <Image source={{ uri: resolveMediaUrl(parada.logo) }} style={{ width: 40, height: 40, borderRadius: 10 }} />
        ) : (
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.fillSubtle }} />
        )}
        {parada.isPrimary && (
          <View style={{ backgroundColor: colors.accentTint, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontSize: 10, fontWeight: "800", color: colors.accent, letterSpacing: 0.3 }}>PRIMÁRIA</Text>
          </View>
        )}
      </View>
      <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>
        {parada.name}
      </Text>
      {parada.genres.length > 0 && (
        <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.textMuted }}>
          {parada.genres.join(" · ")}
        </Text>
      )}
      <View style={{ flexDirection: "row", gap: 14, marginTop: 2 }}>
        <View>
          <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>{parada.stats.weeks}</Text>
          <Text style={{ fontSize: 10, color: colors.textMuted }}>semanas</Text>
        </View>
        <View>
          <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>{parada.stats.numberOnes}</Text>
          <Text style={{ fontSize: 10, color: colors.textMuted }}>nº1</Text>
        </View>
        <View>
          <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>{parada.stats.songs}</Text>
          <Text style={{ fontSize: 10, color: colors.textMuted }}>músicas</Text>
        </View>
      </View>
      {parada.lastWeekLabel && (
        <Text style={{ fontSize: 11, color: colors.textMuted }}>Última: {parada.lastWeekLabel}</Text>
      )}
    </Pressable>
  );
}

export function ParadasListScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const handle = route.params?.handle;
  const query = useUserParadasQuery(handle);

  if (query.isLoading) {
    return (
      <Screen scroll={false}>
        <BackHeader title="Paradas" />
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  const paradas = query.data?.paradas ?? [];

  return (
    <Screen scroll={false}>
      <BackHeader title={query.data?.isOwn ? "Minhas paradas" : "Paradas"} />
      {paradas.length === 0 ? (
        <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 40 }}>
          Nenhuma parada publicada ainda.
        </Text>
      ) : (
        <FlatList
          data={paradas}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          renderItem={({ item }) => <ParadaCardItem parada={item} handle={handle!} navigation={navigation} />}
        />
      )}
    </Screen>
  );
}
