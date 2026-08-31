import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../lib/apiClient";
import type { ChartSong } from "../data/mock";
import type { SpotlightCategory, SpotlightDraft } from "../state/AppState";

interface PublishEntry {
  title: string;
  artist: string;
  album?: string | null;
  spotifyId?: string | null;
  songId?: string | null;
}

interface PublishChartResponse {
  id: string;
  error?: string;
  enrichmentWarning?: { missingCovers: number; message: string };
}

function toPublishEntry(song: ChartSong): PublishEntry {
  return {
    title: song.t,
    artist: song.a,
    album: song.album ?? null,
    spotifyId: song.spotifyId ?? null,
    songId: song.songId ?? null,
  };
}

/** `undefined` (destaque nunca tocado) vira chave ausente no JSON — o PATCH do backend só apaga o que veio no corpo. */
function toSpotlightEntry(song: SpotlightDraft): PublishEntry | null | undefined {
  if (song === undefined) return undefined;
  if (song === null) return null;
  return { title: song.title, artist: song.artist, spotifyId: song.spotifyId ?? null, songId: song.songId ?? null };
}

interface PublishVars {
  songs: ChartSong[];
  paradaId?: string | null;
  weekDate?: string | null;
  spotlights?: Partial<Record<SpotlightCategory, SpotlightDraft>>;
}

function buildChartBody(vars: PublishVars) {
  const s = vars.spotlights ?? {};
  return {
    entries: vars.songs.map(toPublishEntry),
    ...(vars.paradaId ? { paradaId: vars.paradaId } : {}),
    ...(vars.weekDate ? { weekDate: vars.weekDate } : {}),
    flashback: toSpotlightEntry(s.flashback),
    destaque: toSpotlightEntry(s.destaque),
    nacional: toSpotlightEntry(s.nacional),
    push: toSpotlightEntry(s.push),
    radar: toSpotlightEntry(s.radar),
  };
}

export function usePublishChartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: PublishVars) =>
      apiRequest<PublishChartResponse>("/api/charts", {
        method: "POST",
        body: buildChartBody(vars),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/**
 * Atualiza uma parada já publicada. O backend não faz upsert em POST /api/charts
 * (semana já publicada dá 409), então "editar" uma parada da semana atual precisa
 * passar por aqui em vez de tentar criar de novo.
 */
export function useUpdateChartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string } & PublishVars) =>
      apiRequest<{ ok: true }>(`/api/charts/${vars.id}`, {
        method: "PATCH",
        body: buildChartBody(vars),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/** Extrai o id da parada já existente que veio no 409 de "já publicou essa semana". */
export function existingChartIdFromConflict(error: unknown): string | null {
  if (error instanceof ApiError && error.status === 409) {
    if (typeof error.body === "object" && error.body && "id" in error.body) {
      const id = (error.body as { id?: string }).id;
      if (typeof id === "string") return id;
    }
  }
  return null;
}

export function publishErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.body === "object" && error.body && "error" in error.body) {
      const msg = (error.body as { error?: string }).error;
      if (msg) return msg;
    }
    return error.message;
  }
  return "Não foi possível publicar sua parada. Tente novamente.";
}
