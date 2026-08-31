import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export interface ArtistTopSong {
  songId: string;
  title: string;
  spotifyId: string | null;
  coverUrl: string | null;
  weeks: number;
  peak: number;
  numberOnes: number;
}

export interface ArtistAlbum {
  albumId: number;
  title: string;
  coverUrl: string | null;
  releaseYear: number | null;
}

export interface ArtistDetail {
  artistId: number;
  name: string;
  bio: string | null;
  imageUrl: string | null;
  spotifyUrl: string | null;
  genres: string[];
  monthlyListeners: number | null;
  topSongs: ArtistTopSong[];
  albums: ArtistAlbum[];
}

export function useArtistQuery(artistId: number | undefined) {
  return useQuery({
    queryKey: ["artist", artistId],
    queryFn: () => apiRequest<ArtistDetail>(`/api/artist/${artistId}`, { auth: false }),
    enabled: artistId != null,
  });
}
