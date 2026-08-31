import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export interface AlbumSong {
  songId: string;
  title: string;
  spotifyId: string | null;
  weeks: number;
  peak: number;
  numberOnes: number;
}

export interface AlbumDetail {
  albumId: number;
  title: string;
  artist: string;
  artistId: number;
  coverUrl: string | null;
  releaseYear: number | null;
  songs: AlbumSong[];
  reception: { score: number; reviewCount: number } | null;
  artistPath: string;
}

export function useAlbumQuery(albumId: number | undefined) {
  return useQuery({
    queryKey: ["album", albumId],
    queryFn: () => apiRequest<AlbumDetail>(`/api/album/${albumId}`, { auth: false }),
    enabled: albumId != null,
  });
}
