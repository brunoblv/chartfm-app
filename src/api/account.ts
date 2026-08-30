import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../lib/apiClient";

export const GENRE_OPTIONS = [
  "Pop", "Rock", "Hip-Hop", "R&B", "Eletrônica", "Sertanejo", "MPB", "Funk",
  "Indie", "Pagode/Samba", "K-Pop", "Jazz", "Country", "Metal", "Clássica", "Reggae",
];

export function useUpdateHandleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { handle: string; name?: string }) =>
      apiRequest<{ ok: true }>("/api/user/handle", { method: "PATCH", body: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useUpdateGenresMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (genres: string[]) =>
      apiRequest<{ ok: true }>("/api/user/genres", { method: "PATCH", body: { genres } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function accountErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.body === "object" && error.body && "error" in error.body) {
      const msg = (error.body as { error?: string }).error;
      if (msg) return msg;
    }
    return error.message;
  }
  return "Não foi possível salvar. Tente novamente.";
}
