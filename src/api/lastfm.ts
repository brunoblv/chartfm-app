import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { ApiError, apiRequest } from "../lib/apiClient";
import { API_BASE_URL, getQueryParam } from "../lib/api";
import { tokenStorage } from "../lib/tokenStorage";

const TOKEN_KEY = "chartfm_mobile_token";
const LASTFM_CALLBACK_URL = "chartfm://lastfm-callback";

export interface LastfmStatus {
  configured: boolean;
  username: string | null;
  authorized: boolean;
  connected: boolean;
}

export function useLastfmStatusQuery() {
  return useQuery({
    queryKey: ["lastfm", "status"],
    queryFn: () => apiRequest<LastfmStatus>("/api/lastfm/status"),
  });
}

export function useConnectLastfmMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = await tokenStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error("not_signed_in");
      const startUrl = `${API_BASE_URL}/api/lastfm/connect/mobile/start?token=${encodeURIComponent(token)}`;
      const result = await WebBrowser.openAuthSessionAsync(startUrl, LASTFM_CALLBACK_URL);
      if (result.type !== "success" || !result.url) {
        throw new Error(result.type === "cancel" ? "cancelled" : "failed");
      }
      const error = getQueryParam(result.url, "error");
      const status = getQueryParam(result.url, "status");
      if (error || status !== "connected") throw new Error(error ?? "failed");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lastfm", "status"] });
    },
  });
}

export interface LastfmImportSong {
  title: string;
  artist: string;
  album: string;
  spotifyId: string | null;
  imageUrl: string | null;
}

export function useLastfmImportMutation() {
  return useMutation({
    mutationFn: (period: "7days" | "30days") =>
      apiRequest<{ songs: LastfmImportSong[]; total: number; periodLabel: string }>("/api/lastfm/import", {
        method: "POST",
        body: { period, limit: 20 },
      }),
  });
}

export function lastfmErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.body === "object" && error.body && "error" in error.body) {
      const msg = (error.body as { error?: string }).error;
      if (msg) return msg;
    }
    return error.message;
  }
  if (error instanceof Error) {
    if (error.message === "cancelled") return "Conexão cancelada.";
    if (error.message === "not_signed_in") return "Faça login novamente.";
  }
  return "Não foi possível concluir. Tente novamente.";
}
