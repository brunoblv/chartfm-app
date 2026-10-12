// Incorporações do fórum: um link do Spotify ou do YouTube sozinho numa linha vira
// card de player. Mesma leitura do site (`lib/forum-embeds.ts` em C:\ChartFM).

export type ForumEmbed =
  | { kind: "spotify"; type: "track" | "album" | "playlist" | "artist" | "episode" | "show"; id: string; url: string }
  | { kind: "youtube"; id: string; url: string };

export type ForumBodySegment = { kind: "text"; text: string } | { kind: "embed"; embed: ForumEmbed };

export const FORUM_EMBED_MAX = 6;

const SPOTIFY_RE =
  /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}(?:-[a-z]{2})?\/)?(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]{10,32})(?:[/?#]\S*)?$/;
const YOUTUBE_HOST_RE = /^https?:\/\/(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be)\//;
const YOUTUBE_ID_RE = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function parseForumEmbed(line: string): ForumEmbed | null {
  const raw = line.trim();
  if (!raw || /\s/.test(raw)) return null;
  const sp = raw.match(SPOTIFY_RE);
  if (sp) return { kind: "spotify", type: sp[1] as Extract<ForumEmbed, { kind: "spotify" }>["type"], id: sp[2], url: raw };
  if (YOUTUBE_HOST_RE.test(raw)) {
    const id = raw.match(YOUTUBE_ID_RE)?.[1];
    if (id) return { kind: "youtube", id, url: raw };
  }
  return null;
}

export function splitForumBody(body: string): ForumBodySegment[] {
  const out: ForumBodySegment[] = [];
  let buf: string[] = [];
  let embeds = 0;
  const flush = () => {
    const text = buf.join("\n").replace(/^\n+|\n+$/g, "");
    if (text) out.push({ kind: "text", text });
    buf = [];
  };
  for (const line of body.split("\n")) {
    const embed = embeds < FORUM_EMBED_MAX ? parseForumEmbed(line) : null;
    if (embed) {
      flush();
      out.push({ kind: "embed", embed });
      embeds += 1;
    } else {
      buf.push(line);
    }
  }
  flush();
  return out;
}

export function forumEmbedOpenUrl(e: ForumEmbed): string {
  return e.kind === "youtube" ? `https://www.youtube.com/watch?v=${e.id}` : `https://open.spotify.com/${e.type}/${e.id}`;
}

/** URL do oEmbed público (sem login) para buscar título e capa. */
export function forumEmbedOEmbedUrl(e: ForumEmbed): string {
  const target = encodeURIComponent(forumEmbedOpenUrl(e));
  return e.kind === "youtube"
    ? `https://www.youtube.com/oembed?format=json&url=${target}`
    : `https://open.spotify.com/oembed?url=${target}`;
}
