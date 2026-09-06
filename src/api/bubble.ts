import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export type BubbleMatchReason =
  | { type: "sharedArtist"; name: string; href: string; tier: 5 | 10 }
  | { type: "sharedTrack"; name: string; artist?: string; href: string }
  | { type: "overlapPercent"; percent: number };

export type BubbleMatch = {
  matchedUserId: string;
  handle: string;
  name: string;
  image: string | null;
  avatarColor: string;
  score: number;
  artistScore: number;
  trackScore: number;
  albumScore: number;
  sharedArtists: number;
  sharedTracks: number;
  sharedAlbums: number;
  reasons: BubbleMatchReason[];
};

export type BubbleRecommendation = {
  type: "track" | "album" | "artist";
  bucket: string | null;
  entityKey: string;
  name: string;
  artist: string | null;
  href: string;
  score: number;
  usersCount: number;
  avgPosition: number | null;
};

export type BubbleViewData = {
  weekIndex: number;
  calculatedAt: string;
  matches: BubbleMatch[];
  recommendations: {
    tracks: BubbleRecommendation[];
    albums: BubbleRecommendation[];
    artists: {
      never: BubbleRecommendation[];
      little: BubbleRecommendation[];
      trending: BubbleRecommendation[];
    };
  };
};

export type BubbleCenter = {
  name: string;
  handle: string | null;
  image: string | null;
  avatarColor: string;
};

export type BubbleResponse = {
  center: BubbleCenter;
  data: BubbleViewData | null;
};

export const BUBBLE_TABS = ["bolha", "musicas", "albuns", "artistas"] as const;
export type BubbleTab = (typeof BUBBLE_TABS)[number];

export const BUBBLE_TAB_LABELS: Record<BubbleTab, string> = {
  bolha: "Minha Bolha",
  musicas: "Músicas",
  albuns: "Álbuns",
  artistas: "Artistas",
};

export function useBubbleQuery() {
  return useQuery({
    queryKey: ["bubble"],
    queryFn: () => apiRequest<BubbleResponse>("/api/bolha"),
  });
}

export function reasonText(reason: BubbleMatchReason): string {
  switch (reason.type) {
    case "sharedArtist":
      return reason.tier === 5
        ? `${reason.name} está no Top 5 dos dois`
        : `${reason.name} está no Top 10 dos dois`;
    case "sharedTrack":
      return `"${reason.name}" está nas duas paradas`;
    case "overlapPercent":
      return `${reason.percent}% das suas principais preferências estão presentes nos dois perfis`;
  }
}

function songIdFromHref(href: string): string | undefined {
  const match = href.match(/\/song\/(?:\d+_)?([A-Za-z0-9-]+)/);
  return match?.[1];
}

function artistIdFromHref(href: string): number | undefined {
  const match = href.match(/\/artist\/(\d+)/);
  return match ? Number(match[1]) : undefined;
}

function albumIdFromHref(href: string): number | undefined {
  const match = href.match(/\/album\/\d+_(\d+)/);
  return match ? Number(match[1]) : undefined;
}

export function recommendationTarget(rec: BubbleRecommendation):
  | { kind: "song"; songId: string }
  | { kind: "artist"; artistId: number }
  | { kind: "album"; albumId: number }
  | null {
  if (rec.type === "track") {
    const songId = rec.entityKey || songIdFromHref(rec.href);
    return songId ? { kind: "song", songId } : null;
  }
  if (rec.type === "artist") {
    const artistId = artistIdFromHref(rec.href);
    return artistId != null ? { kind: "artist", artistId } : null;
  }
  const albumId = albumIdFromHref(rec.href);
  return albumId != null ? { kind: "album", albumId } : null;
}
