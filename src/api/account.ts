import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../lib/apiClient";
import { API_BASE_URL } from "../lib/api";
import { tokenStorage } from "../lib/tokenStorage";

const TOKEN_KEY = "chartfm_mobile_token";

export interface AvatarPickedImage {
  uri: string;
  name: string;
  type: string;
}

async function uploadAvatar(image: AvatarPickedImage): Promise<{ url: string }> {
  const token = await tokenStorage.getItem(TOKEN_KEY);
  const form = new FormData();
  // RN's fetch reads { uri, name, type } off the object; not a real Blob/File.
  form.append("file", { uri: image.uri, name: image.name, type: image.type } as unknown as Blob);

  const res = await fetch(`${API_BASE_URL}/api/user/avatar`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  const parsed = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (parsed && typeof parsed === "object" && "error" in parsed ? (parsed as any).error : null) ?? "Falha ao enviar a imagem.";
    throw new ApiError(res.status, message, parsed);
  }
  return parsed;
}

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

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useDeleteAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<{ ok: true }>("/api/user/avatar", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
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
