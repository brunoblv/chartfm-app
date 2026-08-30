import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export interface SearchSong {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  spotifyId: string | null;
  artistSpotifyId: string | null;
  coverUrl: string | null;
}
export interface SearchArtist {
  id: number;
  spotifyId: string;
  name: string;
  imageUrl: string | null;
}
export interface SearchUser {
  handle: string;
  name: string;
  avatarColor: string;
  image: string | null;
}
export interface SearchAlbum {
  id: number;
  title: string;
  artist: string;
  artistId: number;
  coverUrl: string | null;
  year: number | null;
}

export interface SearchResults {
  songs: SearchSong[];
  artists: SearchArtist[];
  albums: SearchAlbum[];
  users: SearchUser[];
}

/** Debounce simples: só propaga o valor depois que o usuário para de digitar por `delayMs`. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function useSearchQuery(query: string) {
  const debounced = useDebouncedValue(query.trim(), 300);
  return useQuery({
    queryKey: ["search", debounced],
    queryFn: () => apiRequest<SearchResults>(`/api/search?q=${encodeURIComponent(debounced)}`, { auth: false }),
    enabled: debounced.length >= 2,
  });
}
