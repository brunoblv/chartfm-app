import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export interface ProfileSong {
  title: string;
  artist: string;
  imageUrl?: string | null;
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
    followers: number;
    following: number;
    streak: number;
    verified: boolean;
    charts: ProfileChart[];
  };
  imageUrl: string | null;
  isFollowing: boolean;
  totalCharts: number;
  genres: string[];
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

export function useProfileQuery(handle: string | undefined) {
  return useQuery({
    queryKey: ["profile", handle],
    queryFn: () => apiRequest<ProfilePayload>(`/api/profile/${encodeURIComponent(handle!)}`),
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
