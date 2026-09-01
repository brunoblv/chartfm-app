import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export const HISTORY_FILTERS = [
  "todos",
  "paradas",
  "avaliacoes",
  "recomendacoes",
  "curtidas",
  "comentarios",
  "participacao",
] as const;

export type HistoryFilter = (typeof HISTORY_FILTERS)[number];

export const HISTORY_FILTER_LABELS: Record<HistoryFilter, string> = {
  todos: "Tudo",
  paradas: "Paradas",
  avaliacoes: "Avaliações",
  recomendacoes: "Recomendações",
  curtidas: "Curtidas",
  comentarios: "Comentários",
  participacao: "Participação",
};

export type HistoryEventKind =
  | "chart"
  | "review"
  | "recommendation"
  | "chartLike"
  | "chartComment"
  | "paradaComment"
  | "postReply"
  | "communityJoin"
  | "communityPost"
  | "pushSubmission"
  | "follow";

const KIND_VERB: Record<HistoryEventKind, string> = {
  chart: "publicou a parada",
  review: "avaliou",
  recommendation: "recomendou",
  chartLike: "curtiu a parada de",
  chartComment: "comentou na parada de",
  paradaComment: "comentou em",
  postReply: "respondeu em",
  communityJoin: "entrou em",
  communityPost: "publicou em",
  pushSubmission: "indicou no Push",
  follow: "passou a seguir",
};

export function historyEventVerb(kind: HistoryEventKind): string {
  return KIND_VERB[kind] ?? "";
}

export interface HistoryEvent {
  key: string;
  kind: HistoryEventKind;
  at: string;
  target: string;
  href: string | null;
  excerpt: string | null;
}

export interface ProfileHistoryResponse {
  events: HistoryEvent[];
  page: number;
  hasMore: boolean;
  counts: Record<HistoryFilter, number>;
  filter: HistoryFilter;
}

export function useProfileHistoryQuery(handle: string | undefined, filter: HistoryFilter, page: number) {
  return useQuery({
    queryKey: ["profile-history", handle, filter, page],
    queryFn: () =>
      apiRequest<ProfileHistoryResponse>(
        `/api/profile/${encodeURIComponent(handle!)}/historico?tipo=${filter}&pagina=${page}`,
      ),
    enabled: Boolean(handle),
  });
}
