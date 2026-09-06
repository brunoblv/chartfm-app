import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export const LIBRARY_TYPES = ["song", "album", "artist", "chart", "review"] as const;
export type LibraryItemType = (typeof LIBRARY_TYPES)[number];
export type LibraryFilter = LibraryItemType | "tudo";

export const LIBRARY_FILTER_LABELS: Record<LibraryFilter, string> = {
  tudo: "Tudo",
  song: "Músicas",
  album: "Álbuns",
  artist: "Artistas",
  chart: "Paradas",
  review: "Avaliações",
};

export const LIBRARY_TYPE_LABELS: Record<LibraryItemType, string> = {
  song: "Música",
  album: "Álbum",
  artist: "Artista",
  chart: "Parada",
  review: "Avaliação",
};

export type LibrarySource =
  | "discover"
  | "chart"
  | "profile"
  | "artist"
  | "album"
  | "song"
  | "global"
  | "copa"
  | "push"
  | "search"
  | "review";

const SOURCE_LABEL: Record<LibrarySource, string> = {
  discover: "Descobrir",
  chart: "uma parada",
  profile: "um perfil",
  artist: "uma página de artista",
  album: "uma página de álbum",
  song: "uma página de música",
  global: "as paradas globais",
  copa: "a Copa",
  push: "o Push",
  search: "a busca",
  review: "uma avaliação",
};

export function librarySourceLabel(source: LibrarySource | null): string | null {
  return source ? SOURCE_LABEL[source] : null;
}

export interface LibraryEntry {
  id: string;
  itemType: LibraryItemType;
  itemId: string;
  savedAt: string;
  title: string;
  subtitle: string;
  href: string;
  coverUrl: string | null;
  source: LibrarySource | null;
  sourceUser: { name: string; handle: string } | null;
  albumId?: number | null;
}

export interface LibraryResponse {
  entries: LibraryEntry[];
  counts: Record<LibraryFilter, number>;
  fromPeople: number;
  withSource: number;
  filter: LibraryFilter;
}

export function useLibraryQuery(filter: LibraryFilter) {
  return useQuery({
    queryKey: ["library", filter],
    queryFn: () =>
      apiRequest<LibraryResponse>(`/api/library${filter === "tudo" ? "" : `?tipo=${filter}`}`),
  });
}

export function useLibrarySavedQuery(itemType: LibraryItemType | undefined, itemId: string | undefined) {
  return useQuery({
    queryKey: ["library-saved", itemType, itemId],
    queryFn: () =>
      apiRequest<{ saved: boolean }>(
        `/api/library?itemType=${encodeURIComponent(itemType!)}&itemId=${encodeURIComponent(itemId!)}`,
      ),
    enabled: Boolean(itemType && itemId),
    staleTime: 30_000,
  });
}

export function useToggleLibraryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      itemType: LibraryItemType;
      itemId: string;
      saved: boolean;
      source?: LibrarySource;
    }) =>
      apiRequest<{ saved: boolean }>("/api/library", {
        method: vars.saved ? "DELETE" : "POST",
        body: { itemType: vars.itemType, itemId: vars.itemId, source: vars.source },
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
      queryClient.invalidateQueries({ queryKey: ["library-saved", vars.itemType, vars.itemId] });
    },
  });
}
