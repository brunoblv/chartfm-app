import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";
import type { CoverArt } from "../components/Cover";
import type { GlobalSong } from "../data/mock";
import type { MovementStatus } from "../components/MovementBadge";

export type LeaderboardType = "songs" | "artists";
export type LeaderboardScope = "weekly" | "overall";

interface SongItem {
  id: string | null;
  position: number;
  title: string;
  artist: string;
  album: string;
  spotifyId: string | null;
  coverUrl: string | null;
  points: number;
  movement: MovementStatus;
  delta: number | null;
  peak: number;
  weeks: number;
  numberOnes: number;
}

interface ArtistItem {
  position: number;
  name: string;
  spotifyId: string | null;
  points: number;
  movement: MovementStatus;
  delta: number | null;
  peak: number;
  weeks: number;
  numberOnes: number;
}

export interface LeaderboardResponse<T> {
  weekIndex: number;
  weekLabel: string;
  dateRange: string;
  hasPrevWeek: boolean;
  hasNextWeek: boolean;
  prevWeekIndex: number | null;
  nextWeekIndex: number | null;
  type: LeaderboardType;
  scope: LeaderboardScope;
  items: T[];
}

const DEFAULT_PALETTE: [string, string] = ["#1D1D1F", "#5B5B60"];

function coverFromUrl(coverUrl: string | null, seed: number): CoverArt {
  return { palette: DEFAULT_PALETTE, seed, imageUrl: coverUrl ?? undefined };
}

function metaFor(peak: number, weeks: number): string {
  return `${weeks} ${weeks === 1 ? "semana" : "semanas"} · pico #${peak}`;
}

export function songItemToGlobalSong(item: SongItem, index: number): GlobalSong {
  return {
    t: item.title,
    a: item.artist,
    mv: item.movement,
    d: item.delta ?? undefined,
    cover: coverFromUrl(item.coverUrl, index),
    p: item.position,
    meta: metaFor(item.peak, item.weeks),
  };
}

export function useGlobalSongsQuery(scope: LeaderboardScope = "weekly", week?: number) {
  return useQuery({
    queryKey: ["global", "songs", scope, week ?? "latest"],
    queryFn: () =>
      apiRequest<LeaderboardResponse<SongItem>>(
        `/api/global/leaderboard?type=songs&scope=${scope}${week ? `&week=${week}` : ""}`,
        { auth: false }
      ),
    staleTime: 5 * 60_000,
  });
}

export function useGlobalArtistsQuery(scope: LeaderboardScope = "weekly", week?: number) {
  return useQuery({
    queryKey: ["global", "artists", scope, week ?? "latest"],
    queryFn: () =>
      apiRequest<LeaderboardResponse<ArtistItem>>(
        `/api/global/leaderboard?type=artists&scope=${scope}${week ? `&week=${week}` : ""}`,
        { auth: false }
      ),
    staleTime: 5 * 60_000,
  });
}
