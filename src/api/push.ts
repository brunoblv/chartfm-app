import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../lib/apiClient";

export interface PushSubmissionRow {
  id: string;
  userId: string;
  userHandle: string | null;
  userName: string | null;
  spotifyTrackId: string;
  song: { title: string; artist: string; coverUrl: string | null; spotifyUrl: string | null };
}

export interface PushVoteRow {
  submissionId: string;
  position: number;
}

export interface PushResultRow extends PushSubmissionRow {
  totalPoints: number;
  rank: number;
}

export interface PushRound {
  id: string;
  number: number;
  title: string;
  phase: "SUBMISSION" | "LISTENING" | "RANKING" | "RESULT";
  submissionEndsAt: string;
  listeningEndsAt: string;
  rankingEndsAt: string;
  submissionCount: number;
  mySubmission: PushSubmissionRow | null;
  submissions: PushSubmissionRow[] | null;
  myVotes: PushVoteRow[] | null;
  results: PushResultRow[] | null;
}

const PHASE_LABELS: Record<PushRound["phase"], string> = {
  SUBMISSION: "Período de indicação",
  LISTENING: "Período de escuta",
  RANKING: "Período de avaliação",
  RESULT: "Resultado divulgado",
};

export function pushPhaseLabel(phase: PushRound["phase"]): string {
  return PHASE_LABELS[phase] ?? phase;
}

export function usePushRoundQuery() {
  return useQuery({
    queryKey: ["push", "current"],
    queryFn: () => apiRequest<{ round: PushRound | null }>("/api/push", { auth: false }),
    staleTime: 60_000,
  });
}

export interface PushSubmitResult {
  id: string;
  spotifyTrackId: string;
  song: { title: string; artist: string; coverUrl: string | null; spotifyUrl: string | null };
}

export function usePushSubmitMutation(roundId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (spotifyTrackId: string) =>
      apiRequest<PushSubmitResult>(`/api/push/${roundId}/submit`, {
        method: "POST",
        body: { spotifyTrackId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["push", "current"] });
    },
  });
}

export function usePushVoteMutation(roundId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (votes: { submissionId: string; position: number }[]) =>
      apiRequest<{ ok: true }>(`/api/push/${roundId}/vote`, {
        method: "POST",
        body: { votes },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["push", "current"] });
    },
  });
}

export function pushErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.body === "object" && error.body && "error" in error.body) {
      const msg = (error.body as { error?: string }).error;
      if (msg) return msg;
    }
    return error.message;
  }
  return "Não foi possível enviar sua indicação. Tente novamente.";
}
