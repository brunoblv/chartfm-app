import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../lib/apiClient";

export interface CopaSummary {
  id: string;
  name: string;
  year: number;
  status: "REGISTRATION" | "GROUP_STAGE" | "KNOCKOUT" | "FINISHED";
  isParticipant: boolean;
}

export function useCopaQuery() {
  return useQuery({
    queryKey: ["copa", "active"],
    queryFn: () => apiRequest<{ copa: CopaSummary | null }>("/api/copa", { auth: false }),
    staleTime: 60_000,
  });
}

export interface CopaArtistInfo {
  id: string;
  ownerName: string;
  ownerHandle: string;
  artistName: string;
  artistImage: string | null;
  artistColor: string;
  artistInitials: string;
}

export interface CopaFixture {
  id: string;
  copaId: string;
  phase: string;
  groupLetter: string | null;
  round: number;
  matchIndex: number;
  artistA: CopaArtistInfo;
  artistB: CopaArtistInfo;
  singleAName: string;
  singleBName: string;
  votesA: number;
  votesB: number;
  goalsA: number;
  goalsB: number;
  status: "UPCOMING" | "LIVE" | "DONE";
  myVote: "A" | "B" | null;
}

export function useCopaFixturesQuery(copaId: string | undefined) {
  return useQuery({
    queryKey: ["copa", copaId, "fixtures"],
    queryFn: () => apiRequest<{ fixtures: CopaFixture[] }>(`/api/copa/${copaId}/fixtures`, { auth: false }),
    enabled: Boolean(copaId),
    refetchInterval: 60_000,
  });
}

export interface CopaStandingRow {
  artistId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  votesFor: number;
  votesAgainst: number;
  points: number;
}

export interface CopaGroupStandings {
  letter: string;
  artists: CopaArtistInfo[];
  standings: CopaStandingRow[];
}

export function useCopaStandingsQuery(copaId: string | undefined) {
  return useQuery({
    queryKey: ["copa", copaId, "standings"],
    queryFn: () => apiRequest<{ groups: CopaGroupStandings[] }>(`/api/copa/${copaId}/standings`, { auth: false }),
    enabled: Boolean(copaId),
  });
}

export function useCopaVoteMutation(copaId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { fixtureId: string; side: "A" | "B" }) =>
      apiRequest<{ votesA: number; votesB: number; goalsA: number; goalsB: number }>(`/api/copa/${copaId}/vote`, {
        method: "POST",
        body: vars,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["copa", copaId, "fixtures"] });
      queryClient.invalidateQueries({ queryKey: ["copa", copaId, "standings"] });
    },
  });
}

export function copaErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return "Você já votou nesse confronto.";
    if (typeof error.body === "object" && error.body && "error" in error.body) {
      const msg = (error.body as { error?: string }).error;
      if (msg) return msg;
    }
  }
  return "Não foi possível registrar seu voto. Tente novamente.";
}
