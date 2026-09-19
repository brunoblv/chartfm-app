import { translateApiText } from "../i18n/apiErrors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../lib/apiClient";

export type ClubePhase = "0" | "1" | "2" | "3" | "4";

export interface ClubeAlbumInfo {
  albumId: number;
  title: string;
  artist: string;
  year: string;
  coverUrl: string | null;
  spotifyUrl: string | null;
}

export interface ClubeNomination extends ClubeAlbumInfo {
  id: string;
  nominatedBy: string | null;
}

export interface ClubeWinner extends ClubeAlbumInfo {
  nominationId: string;
  votes: number;
  rank: number;
  nominatedBy: string | null;
  score: number | null;
  reviewCount: number;
}

/** Álbum escolhido pela moderação da semana, à parte da votação dos usuários. */
export interface ClubeCuratorPick extends ClubeAlbumInfo {
  score: number | null;
  reviewCount: number;
}

export interface ClubeRound {
  id: string;
  number: number;
  theme: string;
  dateRange: string;
  phase: ClubePhase;
  nominationsDeadline: string;
  pollDeadline: string;
  nominations: ClubeNomination[];
  winners: ClubeWinner[];
  curator: ClubeCuratorPick | null;
  participantCount: number;
  myNominations: ClubeNomination[] | null;
  /** IDs das indicações no ranking já salvo do usuário, do melhor para o pior. */
  myRankingNominationIds: string[] | null;
  isLoggedIn: boolean;
  identitiesRevealed: boolean;
  roundComplete: boolean;
}

export const CLUBE_PHASE_LABELS: Record<ClubePhase, string> = {
  "0": "Inscrições ainda não abriram",
  "1": "Indicações abertas",
  "2": "Votação aberta",
  "3": "Resultado divulgado",
  "4": "Fase de escuta",
};

export function useClubeQuery() {
  return useQuery({
    queryKey: ["clube", "active"],
    queryFn: () => apiRequest<{ round: ClubeRound | null }>("/api/clube"),
    staleTime: 60_000,
  });
}

export function useClubeNominateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { roundId: string; albumId: number }) =>
      apiRequest<{ ok: true }>("/api/clube/nominations", { method: "POST", body: vars }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clube", "active"] }),
  });
}

/** Ranking por posição (1 = melhor) das indicações elegíveis — mesma mecânica da Votação da Semana. */
export function useClubeRankMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { roundId: string; positions: { nominationId: string; position: number }[] }) =>
      apiRequest<{ ok: true }>("/api/clube/votes", { method: "POST", body: vars }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clube", "active"] }),
  });
}

export function clubeErrorMessage(error: unknown): string {
  return translateApiText(clubeErrorMessagePt(error));
}

function clubeErrorMessagePt(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.body === "object" && error.body && "error" in error.body) {
      const msg = (error.body as { error?: string }).error;
      if (msg) return msg;
    }
    return error.message;
  }
  return "Não foi possível concluir. Tente novamente.";
}
