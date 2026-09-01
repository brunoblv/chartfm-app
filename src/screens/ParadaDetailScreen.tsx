import React from "react";
import { Text, ActivityIndicator } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useAppTheme } from "../theme/ThemeProvider";
import { useProfileQuery } from "../api/profile";
import { ParadaChartCard } from "../components/ParadaChartCard";
import { RootStackParamList } from "../navigation/RootNavigator";

type Route = RouteProp<RootStackParamList, "ParadaDetail">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ParadaDetailScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { handle, paradaId, paradaName } = route.params;
  const profileQuery = useProfileQuery(handle, paradaId);
  const chart = profileQuery.data?.user.charts[0];

  return (
    <Screen>
      <BackHeader title={paradaName} />
      {profileQuery.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : chart ? (
        <ParadaChartCard
          chart={chart}
          onPressEntry={(songId, spotifyId) => navigation.navigate("MusicDetail", { songId, spotifyId: spotifyId ?? undefined })}
          onSeeAllPress={() => navigation.navigate("ChartDetail", { chartId: chart.id })}
        />
      ) : (
        <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 40 }}>
          Essa parada ainda não tem nenhuma semana publicada.
        </Text>
      )}
    </Screen>
  );
}
