import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";
import { useDebouncedValue } from "./search";

export interface CriticsFMAlbum {
  id: number;
  title: string;
  artist: string;
  artistId: number | null;
  genres: string[];
  albumType: string | null;
  releaseDate: string | null;
  coverUrl: string | null;
  score: number;
  reviewCount: number;
}

export interface WeeklyReleaseAlbum {
  albumId: number;
  title: string;
  artist: string;
  year: string;
  coverUrl: string | null;
  spotifyUrl: string | null;
  order: number;
}

export interface WeeklyRelease {
  id: string;
  weekLabel: string;
  albums: WeeklyReleaseAlbum[];
}

export interface CriticsFMHub {
  albums: CriticsFMAlbum[];
  weeklyRelease: WeeklyRelease | null;
}

export interface SpotifyAlbumHit {
  spotifyId: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  albumType: string | null;
  releaseDate: string | null;
  totalTracks: number | null;
  dbId: number | null;
  inDb: boolean;
}

export function useCriticsFMQuery() {
  return useQuery({
    queryKey: ["criticsfm"],
    queryFn: () => apiRequest<CriticsFMHub>("/api/criticsfm", { auth: false }),
    staleTime: 60_000,
  });
}

export function useSpotifyAlbumSearch(query: string) {
  const debounced = useDebouncedValue(query.trim(), 400);
  return useQuery({
    queryKey: ["criticsfm-spotify", debounced],
    queryFn: () =>
      apiRequest<{ results: SpotifyAlbumHit[] }>(
        `/api/criticsfm/search-spotify?q=${encodeURIComponent(debounced)}`,
        { auth: false },
      ),
    enabled: debounced.length >= 1,
  });
}

export function useAddSpotifyAlbumMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (spotifyAlbumId: string) =>
      apiRequest<{ id: number }>("/api/criticsfm/search-spotify", {
        method: "POST",
        body: { spotifyAlbumId },
        auth: false,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["criticsfm"] }),
  });
}
