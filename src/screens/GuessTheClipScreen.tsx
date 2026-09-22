import React, { useState } from "react";
import { View, Text, Pressable, Image, ActivityIndicator, ScrollView, TextInput, Share } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { resolveMediaUrl } from "../lib/api";
import { useTr } from "../i18n/useTr";
import { useSearchQuery, SearchSong } from "../api/search";
import {
  useTodayClipGameQuery,
  useClipGameGuessMutation,
  useClipGameSkipMutation,
  clipGameErrorMessage,
  ClipGamePlayView,
  ClipGameGlobalStats,
} from "../api/games/guessTheClip";
import { buildClipGameShareText } from "../lib/clipGameShare";
import type { RootStackParamList } from "../navigation/RootNavigator";

const SHARE_URL = "https://chartfm.com.br/games/qual-e-o-clipe";

function pointsForLevel(level: number): number {
  const byLevel: Record<number, number> = { 1: 100, 2: 80, 3: 60, 4: 40, 5: 20 };
  return byLevel[level] ?? 0;
}

function BackButton() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() => navigation.goBack()}
      style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
    >
      <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round">
        <Path d="M15 18l-6-6 6-6" />
      </Svg>
    </Pressable>
  );
}

function StatBar({ label, percentage }: { label: string; percentage: number }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
        <Text style={{ fontSize: 12, color: colors.textMuted }}>{label}</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted }}>{percentage}%</Text>
      </View>
      <View style={{ height: 6, borderRadius: 999, backgroundColor: colors.fillSubtle, overflow: "hidden" }}>
        <View style={{ height: "100%", width: `${Math.min(100, percentage)}%`, backgroundColor: colors.accent, borderRadius: 999 }} />
      </View>
    </View>
  );
}

function SongSearchField({ onSelect, disabled }: { onSelect: (song: SearchSong) => void; disabled?: boolean }) {
  const { colors } = useAppTheme();
  const tr = useTr();
  const [query, setQuery] = useState("");
  const searchQuery = useSearchQuery(query);
  const songs = searchQuery.data?.songs ?? [];
  const showResults = query.trim().length >= 2;

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 9,
          backgroundColor: colors.fillSubtle,
          borderRadius: 12,
          padding: 12,
        }}
      >
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round">
          <Circle cx={11} cy={11} r={7} />
          <Path d="M20 20l-3.5-3.5" />
        </Svg>
        <TextInput
          value={query}
          onChangeText={setQuery}
          editable={!disabled}
          placeholder={tr("Qual é a música?")}
          placeholderTextColor={colors.textMuted}
          style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.text, padding: 0 }}
        />
      </View>
      {showResults && (
        <View
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors.divider,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: colors.surface,
          }}
        >
          {searchQuery.isLoading ? (
            <ActivityIndicator color={colors.text} style={{ paddingVertical: 14 }} />
          ) : songs.length === 0 ? (
            <Text style={{ fontSize: 13, color: colors.textMuted, padding: 14 }}>{tr("Nenhuma música encontrada.")}</Text>
          ) : (
            songs.slice(0, 8).map((song, i) => (
              <Pressable
                key={song.id}
                onPress={() => !disabled && onSelect(song)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderBottomWidth: i === songs.slice(0, 8).length - 1 ? 0 : 1,
                  borderBottomColor: colors.dividerSoft,
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                {song.coverUrl ? (
                  <Image source={{ uri: resolveMediaUrl(song.coverUrl) }} style={{ width: 38, height: 38, borderRadius: 8 }} />
                ) : (
                  <View style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: colors.fillSubtle }} />
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "600", color: colors.text }}>
                    {song.title}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
                    {song.artist}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}

function ResultPanel({
  game,
  globalStats,
  onShare,
  onOpenSong,
}: {
  game: ClipGamePlayView;
  globalStats: ClipGameGlobalStats | null;
  onShare: () => void;
  onOpenSong: () => void;
}) {
  const { colors, lang } = useAppTheme();
  const tr = useTr();
  const reveal = game.reveal;
  const correct = game.correct === true;

  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: "800", color: correct ? colors.upFg : colors.downFg, marginBottom: 4 }}>
        {correct ? tr("Você acertou!") : tr("Você não acertou dessa vez")}
      </Text>

      {reveal && (
        <Pressable onPress={onOpenSong} style={{ marginTop: 8, marginBottom: 2 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
            {reveal.title} — {reveal.artist}
          </Text>
        </Pressable>
      )}

      {correct && reveal?.levelReached != null && (
        <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 10 }}>
          {reveal.levelReached === 1
            ? tr("Você acertou com só 1 imagem.")
            : lang === "en"
            ? `You got it using ${reveal.levelReached} images.`
            : `Você acertou usando ${reveal.levelReached} imagens.`}
        </Text>
      )}

      <Text style={{ fontSize: 20, fontWeight: "800", color: correct ? colors.upFg : colors.textMuted, marginVertical: 10 }}>
        {lang === "en" ? `+${game.score} points` : `+${game.score} pontos`}
      </Text>

      {reveal?.global100Position != null && (
        <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 14 }}>
          {lang === "en"
            ? `This song is #${reveal.global100Position} on the Global 100.`
            : `Essa música está na posição #${reveal.global100Position} do Global 100.`}
        </Text>
      )}

      <Pressable
        onPress={onShare}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          alignSelf: "flex-start",
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 999,
          backgroundColor: colors.accent,
        }}
      >
        <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx={18} cy={5} r={3} />
          <Circle cx={6} cy={12} r={3} />
          <Circle cx={18} cy={19} r={3} />
          <Path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </Svg>
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13.5 }}>{tr("Compartilhar")}</Text>
      </Pressable>

      {globalStats && (
        <View style={{ marginTop: 22, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.divider }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: colors.text, marginBottom: 10 }}>{tr("Como as outras pessoas foram")}</Text>
          <Text style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 10 }}>
            {globalStats.totalPlayers === 1
              ? tr("1 pessoa jogou hoje.")
              : lang === "en"
              ? `${globalStats.totalPlayers} people played today.`
              : `${globalStats.totalPlayers} pessoas jogaram hoje.`}
          </Text>
          {globalStats.byLevel.map((row) => (
            <StatBar key={row.level} label={lang === "en" ? `Guessed on image ${row.level}` : `Acertou na imagem ${row.level}`} percentage={row.percentage} />
          ))}
          <StatBar label={tr("Não acertou")} percentage={globalStats.missedPercentage} />
        </View>
      )}
    </View>
  );
}

export function GuessTheClipScreen() {
  const { colors, lang } = useAppTheme();
  const tr = useTr();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const todayQuery = useTodayClipGameQuery();
  const [game, setGame] = useState<ClipGamePlayView | null | undefined>(undefined);
  const [globalStats, setGlobalStats] = useState<ClipGameGlobalStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeGame = game !== undefined ? game : todayQuery.data?.game ?? null;
  const activeGlobalStats = game !== undefined ? globalStats : todayQuery.data?.globalStats ?? null;

  const guessMutation = useClipGameGuessMutation(activeGame?.gameId);
  const skipMutation = useClipGameSkipMutation(activeGame?.gameId);
  const busy = guessMutation.isPending || skipMutation.isPending;

  function applyResult(result: { game: ClipGamePlayView; globalStats?: ClipGameGlobalStats | null }) {
    setGame(result.game);
    setGlobalStats(result.globalStats ?? null);
    setError(null);
  }

  function handleSelect(song: SearchSong) {
    if (!activeGame) return;
    setError(null);
    guessMutation.mutate(song.id, {
      onSuccess: applyResult,
      onError: (err) => setError(clipGameErrorMessage(err)),
    });
  }

  function handleSkip() {
    if (!activeGame) return;
    setError(null);
    skipMutation.mutate(undefined, {
      onSuccess: applyResult,
      onError: (err) => setError(clipGameErrorMessage(err)),
    });
  }

  async function handleShare() {
    if (!activeGame) return;
    const text = buildClipGameShareText({
      gameNumber: activeGame.gameNumber,
      levelReached: activeGame.reveal?.levelReached ?? null,
      score: activeGame.score,
      currentStreak: activeGame.streak.current,
      url: SHARE_URL,
    });
    try {
      await Share.share({ message: text });
    } catch {
      // Cancelado pela pessoa: sem erro visível.
    }
  }

  function handleOpenSong() {
    if (!activeGame?.reveal) return;
    navigation.navigate("MusicDetail", { songId: activeGame.reveal.songId });
  }

  const currentFrame = activeGame?.frames[activeGame.frames.length - 1] ?? null;
  const streakLabel =
    activeGame && activeGame.streak.current > 0
      ? lang === "en"
        ? `${activeGame.streak.current} day streak`
        : activeGame.streak.current === 1
        ? "Sequência de 1 dia"
        : `Sequência de ${activeGame.streak.current} dias`
      : null;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
        <BackButton />
        <Text style={{ fontSize: 16, fontWeight: "800", letterSpacing: -0.4, color: colors.text }}>{tr("Qual é o Clipe?")}</Text>
      </View>

      {todayQuery.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 60 }} />
      ) : !activeGame ? (
        <View style={{ paddingTop: 60, paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text, textAlign: "center", marginBottom: 8 }}>
            {tr("Sem desafio hoje")}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: "center", lineHeight: 19 }}>
            {tr("Volte mais tarde para o próximo desafio do Qual é o Clipe?")}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {streakLabel && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <Svg width={15} height={15} viewBox="0 0 24 24" fill="#FF7A00" stroke="none">
                <Path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1-1-2-1-3 2 1 3 3 3 5a5 5 0 0 1-10 0c0-5 4-6 5-11z" />
              </Svg>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#FF7A00" }}>{streakLabel}</Text>
            </View>
          )}

          <View style={{ borderWidth: 1, borderColor: colors.divider, borderRadius: 16, padding: 16, backgroundColor: colors.surface }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textMuted }}>
                {lang === "en"
                  ? `Image ${activeGame.currentLevel} of ${activeGame.totalLevels}`
                  : `Imagem ${activeGame.currentLevel} de ${activeGame.totalLevels}`}
              </Text>
              {!activeGame.completed && (
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color: colors.upFg,
                    backgroundColor: colors.upBg,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  {lang === "en" ? `Worth ${currentFrame?.points ?? 0} pts` : `Vale ${currentFrame?.points ?? 0} pts`}
                </Text>
              )}
            </View>

            {currentFrame && (
              <Image
                source={{ uri: resolveMediaUrl(currentFrame.imageUrl) }}
                style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 12, marginBottom: 16, backgroundColor: colors.fillSubtle }}
              />
            )}

            {activeGame.completed ? (
              <ResultPanel
                game={activeGame}
                globalStats={activeGlobalStats}
                onShare={handleShare}
                onOpenSong={handleOpenSong}
              />
            ) : (
              <>
                <SongSearchField onSelect={handleSelect} disabled={busy} />
                {error && <Text style={{ fontSize: 12.5, color: colors.downFg, marginTop: 8 }}>{error}</Text>}
                {activeGame.currentLevel < activeGame.totalLevels && (
                  <Pressable
                    onPress={handleSkip}
                    disabled={busy}
                    style={{
                      marginTop: 12,
                      paddingVertical: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.dividerStrong,
                      alignItems: "center",
                      opacity: busy ? 0.6 : 1,
                    }}
                  >
                    {busy ? (
                      <ActivityIndicator color={colors.textMuted} />
                    ) : (
                      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textMuted }}>
                        {lang === "en"
                          ? `See next image (worth ${pointsForLevel(activeGame.currentLevel + 1)} pts)`
                          : `Ver próxima imagem (vale ${pointsForLevel(activeGame.currentLevel + 1)} pts)`}
                      </Text>
                    )}
                  </Pressable>
                )}
              </>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
