import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export interface ProfileSong {
  id: string;
  title: string;
  artist: string;
  imageUrl?: string | null;
  spotifyId?: string | null;
  artistRefId?: number | null;
}

export interface ProfileChartEntry {
  position: number;
  song: ProfileSong;
  status: "new" | "return" | "up" | "down" | "same";
  delta: number | null;
  peak: number;
  weeks: number;
}

export interface ProfileChart {
  id: string;
  week: number;
  weekLabel: string;
  entries: ProfileChartEntry[];
}

export interface ProfileFamilyProgress {
  code: string;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | null;
  value: number;
  nextThreshold: number;
  unlockedTiers: number;
  isComplete: boolean;
}

export interface ProfilePayload {
  user: {
    id: string;
    handle: string;
    name: string;
    avatar: string;
    bio: string;
    followers: number;
    following: number;
    streak: number;
    verified: boolean;
    isStaff: boolean;
    charts: ProfileChart[];
  };
  imageUrl: string | null;
  isFollowing: boolean;
  totalCharts: number;
  genres: string[];
  lastfmUser: string | null;
  twitterUser: string | null;
  instagramUser: string | null;
  activeParadaId: string | null;
  statsSummary?: {
    totalRankedSlots: number;
    numberOnes: number;
  };
  progression: {
    level: { level: number; xp: number; percent: number };
    families: ProfileFamilyProgress[];
    unlocked: number;
    total: number;
  };
}

export function useProfileQuery(handle: string | undefined, paradaId?: string | null) {
  return useQuery({
    queryKey: ["profile", handle, paradaId ?? null],
    queryFn: () =>
      apiRequest<ProfilePayload>(
        `/api/profile/${encodeURIComponent(handle!)}${paradaId ? `?paradaId=${encodeURIComponent(paradaId)}` : ""}`,
      ),
    enabled: Boolean(handle),
  });
}

export interface ParadaCard {
  id: string;
  name: string;
  logo: string | null;
  genres: string[];
  isPrimary: boolean;
  sortOrder: number;
  chartSize: number;
  cadence: "weekly" | "daily";
  stats: { weeks: number; numberOnes: number; songs: number };
  lastWeekLabel: string | null;
}

export interface UserParadasResponse {
  handle: string;
  paradas: ParadaCard[];
  canCreate: boolean;
  isOwn: boolean;
}

export function useUserParadasQuery(handle: string | undefined) {
  return useQuery({
    queryKey: ["profile-paradas", handle],
    queryFn: () => apiRequest<UserParadasResponse>(`/api/profile/${encodeURIComponent(handle!)}/paradas`),
    enabled: Boolean(handle),
  });
}

export interface ProfileFollowUser {
  id: string;
  handle: string;
  name: string;
  avatarColor: string;
  image: string | null;
  verified: boolean;
  followers: number;
  bio: string | null;
  isFollowing: boolean;
}

export interface ProfileFollowersResponse {
  users: ProfileFollowUser[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export function useProfileFollowersQuery(handle: string | undefined, type: "followers" | "following") {
  return useQuery({
    queryKey: ["profile-followers", handle, type],
    queryFn: () =>
      apiRequest<ProfileFollowersResponse>(
        `/api/profile/${encodeURIComponent(handle!)}/followers?type=${type}`,
      ),
    enabled: Boolean(handle),
  });
}

export function useFollowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) =>
      apiRequest<{ following: boolean }>("/api/user/follow", { method: "POST", body: { targetId } }),
    onSuccess: (_data, _targetId, _ctx) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function familyLabel(code: string): string {
  return code
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
