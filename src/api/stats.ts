import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export type StatsArtistRow = {
  key: string;
  name: string;
  href: string;
  appearances: number;
  pct: number;
};

export type StatsGenreRow = {
  key: string;
  name: string;
  pct: number;
};

export type StatsDecadeRow = {
  key: string;
  label: string;
  songs: number;
  pct: number;
};

export type StatsWeekRow = {
  weekIndex: number;
  entries: number;
  pct: number;
};

export type ProfileStatsData = {
  distinctSongs: number;
  distinctArtists: number;
  publishedCharts: number;
  totalSlots: number;
  topArtists: StatsArtistRow[];
  genres: StatsGenreRow[];
  songsWithDate: number;
  decades: StatsDecadeRow[];
  songsWithGenre: number;
  diversity: number | null;
  topArtistShare: number | null;
  timeline: StatsWeekRow[];
};

export interface ProfileStatsResponse {
  name: string;
  handle: string;
  stats: ProfileStatsData;
}

export function useProfileStatsQuery(handle: string | undefined) {
  return useQuery({
    queryKey: ["profile-stats", handle],
    queryFn: () =>
      apiRequest<ProfileStatsResponse>(`/api/profile/${encodeURIComponent(handle!)}/estatisticas`),
    enabled: Boolean(handle),
  });
}

export function weekNumberFromIndex(weekIndex: number): number {
  return weekIndex % 100;
}
