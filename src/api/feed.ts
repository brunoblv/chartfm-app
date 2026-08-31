import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../lib/apiClient";

export interface FeedCover {
  palette: [string, string];
  seed: number;
  imageUrl: string | null;
}

export interface FeedSong {
  id: string;
  title: string;
  artist: string;
  slugArtist: string;
  album: string;
  spotifyId: string | null;
  artistSpotifyId: string | null;
  artistRefId: number | null;
  albumRefId: number | null;
  imageUrl: string | null;
}

export interface FeedChartEntry {
  position: number;
  status: "new" | "return" | "up" | "down" | "same";
  delta: number | null;
  prevPos: number | null;
  peak: number;
  weeks: number;
  cover: FeedCover;
  song: FeedSong;
}

export interface FeedUser {
  id: string;
  handle: string;
  name: string;
  avatar: string;
  imageUrl: string | null;
  bio: string;
  followers: number;
  following: number;
  streak: number;
  verified: boolean;
  paradaNome: string | null;
  paradaLogo: string | null;
}

export interface FeedChart {
  id: string;
  week: number;
  weekLabel: string;
  dateRange: string;
  paradaNome: string;
  community: { slug: string; name: string; icon: string; logoUrl: string | null; coverA: string } | null;
  likes: number;
  comments: number;
  reposts: number;
  entries: FeedChartEntry[];
}

export interface FeedChartItem {
  user: FeedUser;
  chart: FeedChart;
  postedAgo: string;
  createdAt: string;
  isFollowing: boolean;
  isLiked: boolean;
}

export interface FeedRecommendationItem {
  id: string;
  text: string | null;
  type: string;
  rating: number | null;
  likes: number;
  comments: number;
  liked: boolean;
  postedAgo: string;
  createdAt: string;
  kind: "song" | "youtube";
  user: { id: string; handle: string; name: string; avatar: string; imageUrl: string | null; verified: boolean };
  song: {
    id: string;
    title: string;
    artist: string;
    album: string | null;
    spotifyId: string | null;
    artistSpotifyId: string | null;
    artistRefId: number | null;
    coverUrl: string | null;
  } | null;
  youtube: { id: string; title: string | null; channel: string | null } | null;
}

export interface FeedSystemItem {
  id: string;
  text: string;
  targetUrl: string | null;
  postedAgo: string;
  createdAt: string;
}

export interface FeedEditorialItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  publishedAt: string;
  author: string;
  excerpt: string;
  previewImage?: string;
  likes: number;
  comments: number;
}

export type FeedItem =
  | { kind: "chart"; id: string; createdAt: string; item: FeedChartItem }
  | { kind: "recommendation"; id: string; createdAt: string; item: FeedRecommendationItem }
  | { kind: "system"; id: string; createdAt: string; item: FeedSystemItem }
  | { kind: "editorial"; id: string; createdAt: string; item: FeedEditorialItem };

export type FeedTab = "for-you" | "following";

interface FeedPage {
  items: FeedItem[];
  nextCursor: string | null;
}

export function useFeedQuery(tab: FeedTab) {
  return useInfiniteQuery({
    queryKey: ["feed", tab],
    queryFn: ({ pageParam }: { pageParam: string | null }) =>
      apiRequest<FeedPage>(`/api/feed?tab=${tab}${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ""}`),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30_000,
  });
}

export function useLikeChartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chartId: string) => apiRequest<{ liked: boolean; likes: number }>(`/api/charts/${chartId}/like`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });
}

export function useRepostChartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chartId: string) => apiRequest<{ reposted: boolean; reposts: number }>(`/api/charts/${chartId}/repost`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });
}

export function useLikeRecommendationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recommendationId: string) =>
      apiRequest<{ liked: boolean; likes: number }>(`/api/recommendations/${recommendationId}/like`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });
}

export function feedErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.body === "object" && error.body && "error" in error.body) {
      const msg = (error.body as { error?: string }).error;
      if (msg) return msg;
    }
    return error.message;
  }
  return "Não foi possível completar a ação. Tente novamente.";
}
