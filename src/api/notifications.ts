import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export interface NotificationRow {
  id: string;
  type: string;
  text: string;
  read: boolean;
  createdAt: string;
  targetUrl: string | null;
  isFollowingBack?: boolean;
  actor: { id: string; handle: string; name: string; avatarColor: string; image: string | null } | null;
}

/** O site devolve o texto já traduzido para `lang`. */
export function useNotificationsQuery(enabled: boolean, lang: "pt" | "en" = "pt") {
  return useQuery({
    queryKey: ["notifications", lang],
    queryFn: () => apiRequest<NotificationRow[]>(`/api/notifications?lang=${lang}`),
    enabled,
  });
}

export function useMarkNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<{ ok: true }>("/api/notifications", { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function relativeWhen(iso: string, lang: "pt" | "en" = "pt"): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return lang === "en" ? "now" : "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1 && lang !== "en") return "ontem";
  if (days === 1) return "yesterday";
  return `${days}d`;
}

export type NotifFilter = "all" | "like" | "comment" | "follow";

export function matchesFilter(type: string, filter: NotifFilter): boolean {
  if (filter === "all") return true;
  if (filter === "like") return type === "like" || type === "comment_like";
  if (filter === "comment") return type === "comment" || type === "comment_reply";
  return type === "follow";
}

export function bucketOf(iso: string, now: number): "today" | "week" | "earlier" {
  const days = (now - new Date(iso).getTime()) / 86_400_000;
  if (days < 1) return "today";
  if (days < 7) return "week";
  return "earlier";
}
