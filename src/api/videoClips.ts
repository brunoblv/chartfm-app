import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiClient";

export interface SongVideoClip {
  id: string;
  imageUrl: string;
  votes: number;
  uploadedBy: string;
  uploaderName: string;
  uploaderHandle: string;
  hasVoted: boolean;
  isMyChoice: boolean;
  isMyUpload: boolean;
}

export function useSongVideoClipsQuery(songId: string | undefined) {
  return useQuery({
    queryKey: ["song-video-clips", songId],
    queryFn: () => apiRequest<{ clips: SongVideoClip[] }>(`/api/songs/${songId}/video-clips`),
    enabled: Boolean(songId),
  });
}
