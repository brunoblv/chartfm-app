import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export interface DmPerson {
  id: string;
  handle: string;
  name: string;
  avatarColor: string;
  image: string | null;
}

export interface DmPreview {
  id: string;
  other: DmPerson;
  lastText: string;
  lastAt: string;
  unread: number;
}

export interface DmMessage {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
  mine: boolean;
}

export function useConversationsQuery() {
  return useQuery({
    queryKey: ["conversas"],
    queryFn: () => apiRequest<{ conversations: DmPreview[] }>("/api/conversas"),
    refetchInterval: 15_000,
  });
}

export function useUnreadConversationsQuery() {
  return useQuery({
    queryKey: ["conversas", "unread"],
    queryFn: () => apiRequest<{ unread: number }>("/api/conversas/unread"),
    refetchInterval: 30_000,
  });
}

export function useStartConversationMutation() {
  return useMutation({
    mutationFn: (handle: string) =>
      apiRequest<{ id: string; other: DmPerson }>("/api/conversas", { method: "POST", body: { handle } }),
  });
}

export function useConversationQuery(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["conversas", conversationId],
    queryFn: () => apiRequest<{ other: DmPerson; messages: DmMessage[] }>(`/api/conversas/${conversationId}`),
    enabled: Boolean(conversationId),
    refetchInterval: 5_000,
  });
}

export function useSendMessageMutation(conversationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      apiRequest<{ message: DmMessage }>(`/api/conversas/${conversationId}`, { method: "POST", body: { text } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversas", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversas"] });
    },
  });
}

export function useMarkConversationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      apiRequest<{ ok: true }>(`/api/conversas/${conversationId}/read`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversas"] });
    },
  });
}
