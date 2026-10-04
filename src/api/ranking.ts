import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export type ScoreGame = "clip" | "push";
export type ExtraCategory = "destaque" | "flashback" | "nacional" | "push";

export const EXTRA_CATEGORIES: ExtraCategory[] = ["destaque", "flashback", "nacional", "push"];

export interface ScorePlayer {
  userId: string;
  handle: string;
  name: string;
  image: string | null;
  avatarColor: string;
}

export interface OverallRankRow {
  position: number;
  player: ScorePlayer;
  totalPoints: number;
  byGame: Record<ScoreGame, number>;
}

export interface GameRankRow {
  position: number;
  player: ScorePlayer;
  points: number;
  /** Desafios disputados (clipe) ou rodadas vencidas (push). */
  detail: number;
}

export interface ExtraWinsRankRow {
  position: number;
  player: ScorePlayer;
  totalWins: number;
  byCategory: Record<ExtraCategory, number>;
}

export interface ExtraWin {
  weekIndex: number;
  weekLabel: string;
  category: ExtraCategory;
  songTitle: string;
  songArtist: string;
  totalPoints: number;
}

export interface MyScore {
  userId: string;
  totalPoints: number;
  position: number | null;
  games: { game: ScoreGame; points: number; position: number | null }[];
  extraWins: { total: number; position: number | null; byCategory: Record<ExtraCategory, number> };
  recentWins: ExtraWin[];
}

export interface CommunityRanking {
  overall: OverallRankRow[];
  games: Record<ScoreGame, GameRankRow[]>;
  extras: ExtraWinsRankRow[];
  me: MyScore | null;
}

/** Pontuação ChartFM, ranking de cada jogo e vitórias dos extras (`me` só com sessão). */
export function useCommunityRankingQuery() {
  return useQuery({
    queryKey: ["community-ranking"],
    queryFn: () => apiRequest<CommunityRanking>("/api/ranking?limit=100"),
    staleTime: 60_000,
  });
}
