import type { ChartSong } from "../data/mock";

export interface DuplicateGroup {
  title: string;
  /** Posições (1-based) em que a música aparece. */
  positions: number[];
}

function norm(v: string | null | undefined): string {
  return (v ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

function keysFor(s: ChartSong): string[] {
  const keys: string[] = [];
  if (s.spotifyId) keys.push(`sp:${s.spotifyId}`);
  if (s.songId) keys.push(`id:${s.songId}`);
  const t = norm(s.t);
  if (t) keys.push(`ta:${t}|${norm(s.a)}`);
  return keys;
}

/** Mesma regra do site (`lib/chart-duplicates.ts`): spotifyId, songId ou título + artista. */
export function findDuplicateSongs(songs: ChartSong[]): DuplicateGroup[] {
  const parent = songs.map((_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const owner = new Map<string, number>();
  songs.forEach((s, i) => {
    for (const k of keysFor(s)) {
      const seen = owner.get(k);
      if (seen === undefined) owner.set(k, i);
      else parent[find(i)] = find(seen);
    }
  });
  const groups = new Map<number, number[]>();
  songs.forEach((_, i) => {
    const r = find(i);
    groups.set(r, [...(groups.get(r) ?? []), i]);
  });
  return [...groups.values()]
    .filter((g) => g.length > 1)
    .sort((a, b) => a[0] - b[0])
    .map((g) => ({ title: songs[g[0]].t, positions: g.map((i) => i + 1) }));
}
