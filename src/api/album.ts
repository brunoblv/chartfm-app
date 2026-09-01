import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export interface AlbumSong {
  songId: string;
  title: string;
  spotifyId: string | null;
  weeks: number;
  peak: number;
  numberOnes: number;
}

export interface AlbumFan {
  user: { id: string; handle: string; name: string; avatar: string; image: string | null };
  points: number;
}

export interface AlbumDetail {
  albumId: number;
  title: string;
  artist: string;
  artistId: number;
  coverUrl: string | null;
  releaseYear: number | null;
  label: string | null;
  totalTracks: number;
  genres: string[];
  spotifyUrl: string | null;
  songs: AlbumSong[];
  reception: { score: number; reviewCount: number } | null;
  artistPath: string;
  stats: { label: string; value: number; color: string }[];
  topFans: AlbumFan[];
  resumo: string | null;
}

export function useAlbumQuery(albumId: number | undefined) {
  return useQuery({
    queryKey: ["album", albumId],
    queryFn: () => apiRequest<AlbumDetail>(`/api/album/${albumId}`, { auth: false }),
    enabled: albumId != null,
  });
}

export interface AlbumReview {
  id: string;
  rating: number;
  body: string | null;
  helpful: number;
  createdAt: string;
  user: { id: string; handle: string; name: string; avatarColor: string; image: string | null };
}

export function useAlbumReviewsQuery(albumId: number | undefined) {
  return useQuery({
    queryKey: ["album-reviews", albumId],
    queryFn: () => apiRequest<AlbumReview[]>(`/api/albums/${albumId}/reviews`, { auth: false }),
    enabled: albumId != null,
  });
}

export function useToggleReviewHelpfulMutation(albumId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) =>
      apiRequest<{ helpful: boolean }>(`/api/albums/${albumId}/reviews/${reviewId}/helpful`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["album-reviews", albumId] });
    },
  });
}
