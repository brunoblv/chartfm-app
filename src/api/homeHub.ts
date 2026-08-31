import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export type RecapKind =
  | "achievement"
  | "globalEntries"
  | "extraWon"
  | "pushPodium"
  | "pushFinished"
  | "copaAdvanced"
  | "likesReceived"
  | "followersReceived"
  | "chartsPublished"
  | "reviewsPublished"
  | "recommendations"
  | "streak";

export interface RecapItem {
  kind: RecapKind;
  count: number;
  detail?: string;
  weight: number;
}

export interface WeeklyRecap {
  items: RecapItem[];
  xpThisWeek: number;
  level: { level: number; xp: number; percent: number; xpToNextLevel: number; isMaxLevel: boolean };
  from: string;
  to: string;
}

export interface FriendChart {
  chartId: string;
  paradaNome: string;
  authorName: string;
  authorHandle: string;
  authorImage: string | null;
  authorColor: string;
  weekLabel: string;
  commonGenres: string[] | null;
}

export interface SuggestedPerson {
  id: string;
  handle: string;
  name: string;
  image: string | null;
  avatarColor: string;
  followers: number;
  commonGenres: string[];
  chartsPublished: number;
}

export interface WeekStatus {
  streak: number;
  daysLeft: number;
  paradaNome: string | null;
  primaryParadaId: string | null;
  thisWeekChartId: string | null;
}

export interface HomeHubResponse {
  weekStatus: WeekStatus;
  recap: WeeklyRecap;
  friendCharts: FriendChart[];
  people: SuggestedPerson[];
}

export function useHomeHubQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["home", "hub"],
    queryFn: () => apiRequest<HomeHubResponse>("/api/home/hub"),
    enabled,
    staleTime: 60_000,
  });
}

export interface HomeReview {
  id: string;
  rating: number;
  body: string;
  helpful: number;
  authorName: string;
  authorHandle: string;
  authorImage: string | null;
  authorColor: string;
  albumId: number;
  albumTitle: string;
  albumCover: string | null;
  artistId: number;
  artistName: string;
  artistSpotifyId: string | null;
}

export interface HomeReleaseAlbum {
  albumId: number;
  title: string;
  artist: string;
  year: string;
  coverUrl: string | null;
  spotifyUrl: string | null;
  order: number;
}

export interface HomeDiscoveryResponse {
  reviews: HomeReview[];
  releases: { id: string; weekLabel: string; albums: HomeReleaseAlbum[] } | null;
}

export function useHomeDiscoveryQuery() {
  return useQuery({
    queryKey: ["home", "discovery"],
    queryFn: () => apiRequest<HomeDiscoveryResponse>("/api/home/discovery", { auth: false }),
    staleTime: 5 * 60_000,
  });
}

/** Espelha `itemLabel` de c:\ChartFM\components\home-hub\WeeklyRecapCard.tsx. */
export function recapItemLabel(item: RecapItem): string {
  switch (item.kind) {
    case "achievement":
      return item.count === 1 ? "Você desbloqueou uma conquista" : `${item.count} conquistas desbloqueadas`;
    case "globalEntries":
      return item.count === 1
        ? "1 música da sua parada está no Global 100"
        : `${item.count} músicas da sua parada estão no Global 100`;
    case "extraWon":
      return "Sua indicação venceu a votação Extra";
    case "pushPodium":
      return `Você terminou a rodada do Push em #${item.detail ?? "3"}`;
    case "pushFinished":
      return "Você concluiu uma rodada do Push";
    case "copaAdvanced":
      return "Sua música avançou de fase na Copa";
    case "likesReceived":
      return `${item.count} curtidas nas suas publicações`;
    case "followersReceived":
      return `${item.count} pessoas começaram a te seguir`;
    case "chartsPublished":
      return `${item.count} paradas publicadas`;
    case "reviewsPublished":
      return `${item.count} reviews escritas`;
    case "recommendations":
      return `${item.count} músicas recomendadas`;
    case "streak":
      return "Sua sequência semanal rendeu bônus";
  }
}
