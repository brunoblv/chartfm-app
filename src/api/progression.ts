import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export interface Progression {
  level: number;
  xp: number;
  percent: number;
}

export function useProgressionQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["me", "progression"],
    queryFn: () => apiRequest<{ progression: Progression | null }>("/api/me/progression"),
    enabled,
    staleTime: 60_000,
  });
}
