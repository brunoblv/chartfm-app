import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../lib/apiClient";

export type ForumTag = "album" | "single" | "clipe" | "noticia" | "debate" | "lista" | "evento" | "tela";
export type ForumSort = "hot" | "recent" | "top" | "unanswered";

export interface ForumCategory {
  id: string;
  name: string;
  desc: string;
  topics: number;
  activeToday: number;
}

export interface ForumUser {
  id: string;
  handle: string;
  name: string;
  avatarColor: string;
  image: string | null;
  moderator: boolean;
}

export interface ForumEntity {
  kind: "album" | "single" | "artist" | "clipe" | string | null;
  id: string | null;
  name: string;
  artist: string | null;
  year: number | null;
  image: string | null;
}

export interface ForumTopicRemoved {
  id: string;
  removed: true;
  categoryId: string;
  removedReason: string;
  createdAt: string;
}

export interface ForumTopic {
  id: string;
  removed: false;
  categoryId: string;
  tag: ForumTag;
  title: string;
  excerpt: string;
  body?: string;
  entity: ForumEntity | null;
  spoiler: boolean;
  pinned: boolean;
  closed: boolean;
  likes: number;
  comments: number;
  views: number;
  liked: boolean;
  saved: boolean;
  createdAt: string;
  editedAt: string | null;
  lastActivityAt: string;
  author: ForumUser;
}

export type ForumTopicItem = ForumTopic | ForumTopicRemoved;

export interface ForumTopicDetail extends ForumTopic {
  body: string;
  canModerate: boolean;
  isAuthor: boolean;
}

export interface ForumCommentRemoved {
  id: string;
  parentId: string | null;
  removed: true;
  createdAt: string;
}

export interface ForumCommentLive {
  id: string;
  parentId: string | null;
  removed: false;
  text: string;
  likes: number;
  liked: boolean;
  featured: boolean;
  isTopicAuthor: boolean;
  createdAt: string;
  author: ForumUser;
}

export type ForumCommentItem = ForumCommentLive | ForumCommentRemoved;
export type ForumCommentThread = ForumCommentItem & { replies: ForumCommentItem[] };

export interface ForumTopicsFilter {
  category?: string;
  tag?: ForumTag | null;
  sort?: ForumSort;
  q?: string;
  saved?: boolean;
  mine?: boolean;
  enabled?: boolean;
}

export function useForumCategoriesQuery() {
  return useQuery({
    queryKey: ["forum", "categories"],
    queryFn: () => apiRequest<ForumCategory[]>("/api/forum/categories", { auth: false }),
  });
}

export function useForumTopicsQuery(filter: ForumTopicsFilter) {
  const { enabled = true, ...f } = filter;
  return useInfiniteQuery({
    queryKey: ["forum", "topics", f],
    enabled,
    initialPageParam: "0",
    queryFn: ({ pageParam }) => {
      const sp = new URLSearchParams();
      if (f.category) sp.set("category", f.category);
      if (f.tag) sp.set("tag", f.tag);
      if (f.sort) sp.set("sort", f.sort);
      if (f.q) sp.set("q", f.q);
      if (f.saved) sp.set("saved", "1");
      if (f.mine) sp.set("mine", "1");
      sp.set("cursor", pageParam);
      return apiRequest<{ topics: ForumTopicItem[]; nextCursor: string | null }>(`/api/forum/topics?${sp.toString()}`);
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useForumTopicQuery(id: string) {
  return useQuery({
    queryKey: ["forum", "topic", id],
    queryFn: () => apiRequest<ForumTopicDetail>(`/api/forum/topics/${id}`),
  });
}

export function useForumCommentsQuery(id: string, sort: "relevant" | "recent") {
  return useQuery({
    queryKey: ["forum", "comments", id, sort],
    queryFn: () =>
      apiRequest<{ total: number; comments: ForumCommentThread[] }>(`/api/forum/topics/${id}/comments?sort=${sort}`),
  });
}

export function useForumToggleLike(topicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<{ liked: boolean; likes: number }>(`/api/forum/topics/${topicId}/like`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useForumToggleSave(topicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<{ saved: boolean }>(`/api/forum/topics/${topicId}/save`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useForumCommentLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      apiRequest<{ liked: boolean; likes: number }>(`/api/forum/comments/${commentId}/like`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum", "comments"] }),
  });
}

export function useForumAddComment(topicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { text: string; parentId?: string | null }) =>
      apiRequest<ForumCommentLive>(`/api/forum/topics/${topicId}/comments`, { method: "POST", body: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export interface ForumCreateInput {
  categoryId: string;
  tag: ForumTag;
  title: string;
  body: string;
  spoiler?: boolean;
  entity?: Omit<ForumEntity, "kind"> & { kind: "album" | "single" | "artist" | "clipe" } | null;
}

export function useForumCreateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ForumCreateInput) =>
      apiRequest<ForumTopic>("/api/forum/topics", { method: "POST", body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useForumModerateTopic(topicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: { pinned?: boolean; closed?: boolean; removed?: boolean }) =>
      apiRequest<{ ok: true }>(`/api/forum/topics/${topicId}`, { method: "PATCH", body: patch }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum"] }),
  });
}

/** Códigos de erro da API do fórum em linguagem comum (já passando por tr no chamador). */
export function forumErrorKey(e: unknown): string {
  const msg = e instanceof ApiError ? e.message : "";
  switch (msg) {
    case "topic_closed":
      return "Este tópico está fechado para novas respostas.";
    case "empty_text":
    case "empty_body":
      return "Escreva algo antes de enviar.";
    case "too_long":
      return "O texto está longo demais.";
    case "invalid_title":
      return "O título precisa ter entre 10 e 80 caracteres.";
    case "unauthorized":
      return "Entre na sua conta para participar.";
    default:
      return "Não foi possível concluir. Tente novamente.";
  }
}

export function relativeTime(iso: string, lang: "pt" | "en"): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const n = (v: number, pt: string, en: string) => (lang === "en" ? `${v}${en} ago` : `há ${v} ${pt}`);
  if (s < 60) return lang === "en" ? "now" : "agora";
  if (s < 3600) return n(Math.floor(s / 60), "min", "m");
  if (s < 86400) return n(Math.floor(s / 3600), "h", "h");
  const d = Math.floor(s / 86400);
  if (d === 1) return lang === "en" ? "yesterday" : "ontem";
  return n(d, "dias", "d");
}
