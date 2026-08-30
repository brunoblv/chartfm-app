import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, Image } from "react-native";
import Svg, { Path } from "react-native-svg";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { PillButton } from "../components/PillButton";
import {
  usePushRoundQuery,
  usePushVoteMutation,
  pushErrorMessage,
  pushPhaseLabel,
  PushSubmissionRow,
} from "../api/push";

export function PushRankScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const roundQuery = usePushRoundQuery();
  const round = roundQuery.data?.round;
  const voteMutation = usePushVoteMutation(round?.id);

  const eligible = useMemo(() => {
    if (!round?.submissions) return [];
    return round.submissions.filter((s) => s.id !== round.mySubmission?.id);
  }, [round]);

  const [order, setOrder] = useState<PushSubmissionRow[]>([]);

  useEffect(() => {
    if (eligible.length === 0) return;
    const myVotes = round?.myVotes;
    if (myVotes && myVotes.length === eligible.length) {
      const byId = new Map(eligible.map((s) => [s.id, s]));
      const sorted = [...myVotes].sort((a, b) => a.position - b.position).map((v) => byId.get(v.submissionId)).filter(Boolean) as PushSubmissionRow[];
      setOrder(sorted.length === eligible.length ? sorted : eligible);
    } else {
      setOrder(eligible);
    }
  }, [eligible, round?.myVotes]);

  const canVote = round?.phase === "LISTENING" || round?.phase === "RANKING";

  const handleSubmit = () => {
    if (!round || voteMutation.isPending) return;
    const votes = order.map((s, i) => ({ submissionId: s.id, position: i + 1 }));
    voteMutation.mutate(votes, {
      onSuccess: () => {
        Alert.alert("Avaliação enviada", "Seu ranking foi registrado.", [{ text: "OK", onPress: () => navigation.goBack() }]);
      },
      onError: (error) => Alert.alert("Não foi possível enviar", pushErrorMessage(error)),
    });
  };

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<PushSubmissionRow>) => {
    const index = getIndex() ?? 0;
    return (
      <ScaleDecorator>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingVertical: 9,
            paddingHorizontal: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.dividerSoft,
            backgroundColor: isActive ? colors.surfaceElevated : colors.surface,
          }}
        >
          <Text style={{ width: 24, fontSize: 16, fontWeight: "800", letterSpacing: -0.5, color: colors.text }}>{index + 1}</Text>
          {item.song.coverUrl ? (
            <Image source={{ uri: item.song.coverUrl }} style={{ width: 44, height: 44, borderRadius: 10 }} />
          ) : (
            <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: colors.fillSubtle }} />
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{item.song.title}</Text>
            <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>{item.song.artist}</Text>
          </View>
          <Pressable onLongPress={drag} delayLongPress={80} style={{ width: 34, height: 38, alignItems: "center", justifyContent: "center" }}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={1.9} strokeLinecap="round">
              <Path d="M4 8h16M4 12h16M4 16h16" />
            </Svg>
          </Pressable>
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <BackHeader title="Avaliar rodada — Push" />

        {roundQuery.isLoading ? (
          <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
        ) : !round ? (
          <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 40 }}>Nenhuma rodada ativa.</Text>
        ) : !canVote ? (
          <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 40, paddingHorizontal: 30 }}>
            {round.title} está em "{pushPhaseLabel(round.phase)}" — avaliação só é aceita nos períodos de escuta e avaliação.
          </Text>
        ) : eligible.length === 0 ? (
          <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 40, paddingHorizontal: 30 }}>
            Não há indicações de outras pessoas para avaliar nesta rodada ainda.
          </Text>
        ) : (
          <>
            <Text style={{ paddingHorizontal: 20, fontSize: 12.5, color: colors.textMuted, marginBottom: 10 }}>
              Segure e arraste para ordenar da que você mais gosta (topo) para a que menos gosta.
            </Text>
            <DraggableFlatList
              data={order}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              onDragEnd={({ data }) => setOrder(data)}
              containerStyle={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}
              contentContainerStyle={{ paddingBottom: 96 }}
            />
            <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: colors.bgTopbar, borderTopWidth: 0.5, borderTopColor: colors.divider }}>
              <PillButton label="Enviar avaliação" onPress={handleSubmit} loading={voteMutation.isPending} />
            </View>
          </>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
