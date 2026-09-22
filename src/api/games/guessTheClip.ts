import { translateApiText } from "../../i18n/apiErrors";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../../lib/apiClient";

export interface ClipGameFramePublic {
  level: number;
  points: number;
  imageUrl: string;
}

export interface ClipGameRevealPublic {
  songId: string;
  title: string;
  artist: string;
  path: string;
  levelReached: number | null;
  global100Position: number | null;
}

export interface ClipGamePlayView {
  gameId: string;
  gameNumber: number;
  scheduledDateKey: string;
  status: string;
  currentLevel: number;
  totalLevels: number;
  frames: ClipGameFramePublic[];
  completed: boolean;
  correct: boolean | null;
  score: number;
  attempts: number;
  streak: { current: number; longest: number };
  reveal: ClipGameRevealPublic | null;
}

export interface ClipGameGlobalStats {
  totalPlayers: number;
  byLevel: { level: number; percentage: number }[];
  missedPercentage: number;
}

export interface ClipGameTodayResponse {
  game: ClipGamePlayView | null;
  globalStats: ClipGameGlobalStats | null;
}

export function useTodayClipGameQuery() {
  return useQuery({
    queryKey: ["clip-game", "today"],
    queryFn: () => apiRequest<ClipGameTodayResponse>("/api/games/guess-the-clip/today"),
    staleTime: 30_000,
  });
}

interface ClipGameActionResponse {
  game: ClipGamePlayView;
  globalStats?: ClipGameGlobalStats | null;
}

export function useClipGameGuessMutation(gameId: string | undefined) {
  return useMutation({
    mutationFn: (songId: string) =>
      apiRequest<ClipGameActionResponse>(`/api/games/guess-the-clip/${gameId}/guess`, {
        method: "POST",
        body: { songId },
      }),
  });
}

export function useClipGameSkipMutation(gameId: string | undefined) {
  return useMutation({
    mutationFn: () => apiRequest<ClipGameActionResponse>(`/api/games/guess-the-clip/${gameId}/skip`, { method: "POST" }),
  });
}

export function clipGameErrorMessage(error: unknown): string {
  return translateApiText(clipGameErrorMessagePt(error));
}

function clipGameErrorMessagePt(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Sua sessão expirou. Faça login novamente.";
    if (error.status === 409) return "Não há mais imagens para liberar";
    if (typeof error.body === "object" && error.body && "error" in error.body) {
      const msg = (error.body as { error?: string }).error;
      if (msg) return msg;
    }
  }
  return "Não foi possível completar a ação. Tente novamente.";
}
