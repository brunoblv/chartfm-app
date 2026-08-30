import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";
import type { AuthUser } from "../state/AuthContext";

export function useMeQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiRequest<{ user: AuthUser }>("/api/auth/mobile/me"),
    enabled,
  });
}
