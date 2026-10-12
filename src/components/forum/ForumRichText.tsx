import React from "react";
import { View, Text, Pressable, Image, Linking, StyleSheet, StyleProp, TextStyle } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAppTheme } from "../../theme/ThemeProvider";
import { useTr } from "../../i18n/useTr";
import { ForumEmbed, forumEmbedOEmbedUrl, forumEmbedOpenUrl, splitForumBody } from "../../lib/forumEmbeds";
import { Icon } from "./ForumParts";

const PLAY = ["M8 5v14l11-7z"];
const SPOTIFY_GREEN = "#1DB954";
const YOUTUBE_RED = "#FF0000";

type OEmbed = { title?: string; author_name?: string; thumbnail_url?: string };

function useOEmbed(e: ForumEmbed) {
  return useQuery({
    queryKey: ["forum-oembed", e.kind, e.id],
    queryFn: async (): Promise<OEmbed> => {
      const res = await fetch(forumEmbedOEmbedUrl(e));
      if (!res.ok) return {};
      return (await res.json()) as OEmbed;
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
}

/** Card de música do Spotify ou vídeo do YouTube; um toque abre no app de cada um. */
export function ForumEmbedCard({ embed }: { embed: ForumEmbed }) {
  const tr = useTr();
  const { colors } = useAppTheme();
  const meta = useOEmbed(embed).data;
  const open = () => Linking.openURL(forumEmbedOpenUrl(embed));

  if (embed.kind === "youtube") {
    const thumb = meta?.thumbnail_url ?? `https://img.youtube.com/vi/${embed.id}/hqdefault.jpg`;
    return (
      <Pressable
        onPress={open}
        accessibilityRole="link"
        accessibilityLabel={meta?.title ? `${tr("Vídeo do YouTube")}: ${meta.title}` : tr("Vídeo do YouTube")}
        style={{ borderRadius: 14, overflow: "hidden", backgroundColor: colors.fillSubtle }}
      >
        <View style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" }}>
          <Image source={{ uri: thumb }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          <View style={[StyleSheet.absoluteFillObject, { alignItems: "center", justifyContent: "center" }]}>
            <View style={{ width: 60, height: 42, borderRadius: 12, backgroundColor: YOUTUBE_RED, alignItems: "center", justifyContent: "center" }}>
              <Icon d={PLAY} size={22} color="#fff" fill="#fff" strokeWidth={0} />
            </View>
          </View>
        </View>
        {meta?.title ? (
          <View style={{ padding: 12, gap: 2 }}>
            <Text numberOfLines={2} style={{ fontSize: 14.5, fontWeight: "700", color: colors.text }}>{meta.title}</Text>
            {meta.author_name ? <Text numberOfLines={1} style={{ fontSize: 12.5, color: colors.textMuted }}>{meta.author_name}</Text> : null}
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={open}
      accessibilityRole="link"
      accessibilityLabel={meta?.title ? `${tr("Ouvir no Spotify")}: ${meta.title}` : tr("Ouvir no Spotify")}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: 14, backgroundColor: colors.fillSubtle }}
    >
      {meta?.thumbnail_url ? (
        <Image source={{ uri: meta.thumbnail_url }} style={{ width: 64, height: 64, borderRadius: 8 }} />
      ) : (
        <View style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: colors.divider }} />
      )}
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text numberOfLines={2} style={{ fontSize: 14.5, fontWeight: "700", color: colors.text }}>{meta?.title ?? tr("Spotify")}</Text>
        <Text style={{ fontSize: 12.5, fontWeight: "600", color: SPOTIFY_GREEN }}>{tr("Ouvir no Spotify")}</Text>
      </View>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: SPOTIFY_GREEN, alignItems: "center", justifyContent: "center" }}>
        <Icon d={PLAY} size={16} color="#000" fill="#000" strokeWidth={0} />
      </View>
    </Pressable>
  );
}

/** Texto do fórum com os links do Spotify/YouTube (sozinhos na linha) virando card. */
export function ForumRichText({ text, style }: { text: string; style: StyleProp<TextStyle> }) {
  const segments = splitForumBody(text);
  if (segments.every((s) => s.kind === "text")) {
    return <Text selectable style={style}>{text}</Text>;
  }
  return (
    <View style={{ gap: 10 }}>
      {segments.map((s, i) =>
        s.kind === "text" ? (
          <Text key={i} selectable style={style}>{s.text}</Text>
        ) : (
          <ForumEmbedCard key={i} embed={s.embed} />
        ),
      )}
    </View>
  );
}
