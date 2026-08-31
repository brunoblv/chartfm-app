import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export type NotifPrefCategory = "chart" | "social";

export interface NotifPrefsResponse {
  prefs: Record<NotifPrefCategory, boolean>;
}

export function useNotificationPrefsQuery() {
  return useQuery({
    queryKey: ["me", "notification-prefs"],
    queryFn: () => apiRequest<NotifPrefsResponse>("/api/user/notification-prefs"),
    staleTime: 60_000,
  });
}

export function useUpdateNotificationPrefsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Record<NotifPrefCategory, boolean>>) =>
      apiRequest<NotifPrefsResponse>("/api/user/notification-prefs", { method: "PATCH", body: patch }),
    onSuccess: (data) => {
      queryClient.setQueryData(["me", "notification-prefs"], data);
    },
  });
}
