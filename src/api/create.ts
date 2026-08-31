import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../lib/apiClient";

export interface CreateRecommendationPayload {
  songId?: string;
  spotifyId?: string;
  title?: string;
  artist?: string;
  album?: string;
  text?: string;
}

/** Espelha `POST /api/recommendations` de c:\ChartFM\app\api\recommendations\route.ts. */
export function useCreateRecommendationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRecommendationPayload) =>
      apiRequest<{ id: string }>("/api/recommendations", { method: "POST", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discover", "recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export interface SubmitAlbumReviewPayload {
  albumId: number;
  rating: number;
  reviewBody?: string;
}

export interface AlbumReviewResult {
  id: string;
  rating: number;
  body: string | null;
  helpful: number;
  createdAt: string;
}

/** Espelha `POST /api/albums/[albumId]/reviews` de c:\ChartFM\app\api\albums\[albumId]\reviews\route.ts. */
export function useSubmitAlbumReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ albumId, rating, reviewBody }: SubmitAlbumReviewPayload) =>
      apiRequest<AlbumReviewResult>(`/api/albums/${albumId}/reviews`, {
        method: "POST",
        body: { rating, reviewBody },
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["album", variables.albumId] });
    },
  });
}

export function createErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.body === "object" && error.body && "error" in error.body) {
      const msg = (error.body as { error?: string }).error;
      if (msg === "too_long") return "O texto passou de 1000 caracteres.";
      if (msg === "missing_song") return "Escolha uma música.";
      if (msg) return msg;
    }
    return error.message;
  }
  return "Não foi possível completar a ação. Tente novamente.";
}
