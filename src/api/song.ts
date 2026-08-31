import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export interface SongGlobalStats {
  weeks: number;
  peak: number;
  numberOnes: number;
}

export interface SongDetail {
  songId: string;
  title: string;
  artist: string;
  albumTitle: string | null;
  artistId: number | null;
  albumId: number | null;
  spotifyId: string | null;
  coverUrl: string | null;
  genres: string[];
  editorialNote: string | null;
  globalStats: SongGlobalStats;
  albumScore: { score: number; reviewCount: number } | null;
  artistPath: string;
  albumPath: string | null;
}

export function useSongQuery(songId: string | undefined) {
  return useQuery({
    queryKey: ["song", songId],
    queryFn: () => apiRequest<SongDetail>(`/api/song/${encodeURIComponent(songId!)}`, { auth: false }),
    enabled: Boolean(songId),
  });
}
