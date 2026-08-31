import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";
import type { CoverArt } from "../components/Cover";

export interface RecommendationItem {
  id: string;
  text: string | null;
  type: string;
  user: { id: string; handle: string; name: string; imageUrl: string | null };
  song: { id: string; title: string; artist: string; coverUrl: string | null } | null;
}

export interface TrendingCard {
  key: string;
  t: string;
  a: string;
  why: string;
  cover: CoverArt;
  songId: string;
}

function toTrendingCard(item: RecommendationItem, index: number): TrendingCard | null {
  if (!item.song) return null;
  return {
    key: item.id,
    t: item.song.title,
    a: item.song.artist,
    why: `${item.user.name} recomendou`,
    cover: { palette: ["#1D1D1F", "#5B5B60"], seed: index, imageUrl: item.song.coverUrl ?? undefined },
    songId: item.song.id,
  };
}

export function useRecommendationsQuery() {
  const query = useQuery({
    queryKey: ["discover", "recommendations"],
    queryFn: () => apiRequest<RecommendationItem[]>("/api/recommendations", { auth: false }),
    staleTime: 60_000,
  });

  const cards = (query.data ?? [])
    .map(toTrendingCard)
    .filter((c): c is TrendingCard => c != null)
    .slice(0, 8);

  return { ...query, cards };
}

export interface MysteryTrack {
  title: string;
  artist: string;
  spotifyId: string | null;
  coverUrl: string | null;
  palette: [string, string];
  publisher: { id: string; handle: string; name: string; image: string | null } | null;
}

export function useMysteryTrackQuery() {
  return useQuery({
    queryKey: ["discover", "mystery-track"],
    queryFn: () => apiRequest<{ track: MysteryTrack | null }>("/api/discover/mystery-track", { auth: false }),
    staleTime: 5 * 60_000,
  });
}
