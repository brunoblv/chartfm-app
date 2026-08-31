import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export interface ParadaSummary {
  id: string;
  name: string;
  isPrimary: boolean;
  chartSize: number;
  cadence: "weekly" | "daily";
}

export interface ParadasResponse {
  paradaNome: string | null;
  paradaId: string | null;
  paradas: ParadaSummary[];
}

export function useParadasQuery() {
  return useQuery({
    queryKey: ["paradas"],
    queryFn: () => apiRequest<ParadasResponse>("/api/user/chart-name"),
  });
}

export function useChartWeeksQuery(paradaId: string | null | undefined) {
  return useQuery({
    queryKey: ["chartWeeks", paradaId],
    queryFn: () => apiRequest<{ weekIndexes: number[] }>(`/api/charts/weeks?paradaId=${encodeURIComponent(paradaId!)}`),
    enabled: Boolean(paradaId),
  });
}
