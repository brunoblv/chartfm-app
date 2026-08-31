import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";
import { CoverArt } from "../components/Cover";

export interface ChartSpotlightSong {
  id: string;
  title: string;
  artist: string;
  spotifyId: string | null;
  spotifyUrl: string | null;
  cover: CoverArt;
}

export interface ChartDetailSong {
  id?: string | null;
  title: string;
  artist: string;
  imageUrl?: string | null;
  spotifyId?: string | null;
}

export interface ChartDetailEntry {
  position: number;
  song: ChartDetailSong;
  cover: CoverArt;
  status: "new" | "return" | "up" | "down" | "same";
  delta: number | null;
  peak: number;
  weeks: number;
}

export interface ChartDetailPayload {
  id: string;
  week: number;
  weekLabel: string;
  dateRange: string;
  paradaNome?: string | null;
  entries: ChartDetailEntry[];
  likes: number;
  comments: number;
  reposts: number;
}

export interface ChartDetailResponse {
  user: {
    id: string;
    handle: string;
    name: string;
    avatar: string;
  };
  chart: ChartDetailPayload;
  paradaId?: string;
  imageUrl: string | null;
  flashback?: ChartSpotlightSong | null;
  destaque?: ChartSpotlightSong | null;
  nacional?: ChartSpotlightSong | null;
  push?: ChartSpotlightSong | null;
  radar?: ChartSpotlightSong | null;
}

export function useChartDetailQuery(chartId: string | undefined) {
  return useQuery({
    queryKey: ["chartDetail", chartId],
    queryFn: () => apiRequest<ChartDetailResponse>(`/api/charts/${encodeURIComponent(chartId!)}`),
    enabled: Boolean(chartId),
  });
}
