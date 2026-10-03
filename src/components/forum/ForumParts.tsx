import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useAppTheme } from "../../theme/ThemeProvider";
import { UserAvatar } from "../UserAvatar";
import { resolveMediaUrl } from "../../lib/api";
import { useTr } from "../../i18n/useTr";
import { ForumEntity, ForumTag, ForumTopic, ForumTopicRemoved, relativeTime } from "../../api/forum";

export const TAG_META: Record<ForumTag, { label: string; color: string; icon: string[] }> = {
  album: { label: "Álbum", color: "#FA243C", icon: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"] },
  single: { label: "Single", color: "#FF7A1A", icon: ["M9 18V5l12-2v13", "M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", "M18 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"] },
  clipe: { label: "Clipe", color: "#7B61FF", icon: ["M5 4h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z", "M10 9l5 3-5 3z"] },
  noticia: { label: "Notícia", color: "#0A84FF", icon: ["M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2z", "M18 14h-8", "M15 18h-5", "M10 6h8v4h-8z"] },
  debate: { label: "Debate", color: "#1FA463", icon: ["M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2z", "M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"] },
  lista: { label: "Lista", color: "#D99A00", icon: ["M10 6h11", "M10 12h11", "M10 18h11", "M4 6h1v4", "M4 10h2"] },
  evento: { label: "Evento", color: "#FF2D92", icon: ["M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "M16 2v4", "M8 2v4", "M3 10h18"] },
  tela: { label: "Filme & Série", color: "#5E5CE6", icon: ["M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z"] },
};

export function Icon({ d, size = 16, color, strokeWidth = 1.9, fill }: { d: string[]; size?: number; color: string; strokeWidth?: number; fill?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill ?? "none"} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {d.map((p, i) => (
        <Path key={i} d={p} />
      ))}
    </Svg>
  );
}

export const ICONS = {
  heart: ["M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"],
  reply: ["M7.9 20A9 9 0 1 0 4 16.1L2 22z"],
  eye: ["M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  bookmark: ["m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"],
  lock: ["M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z", "M7 11V7a5 5 0 0 1 10 0v4"],
  pin: ["M12 17v5", "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"],
  more: ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
  plus: ["M12 5v14", "M5 12h14"],
  send: ["m22 2-7 20-4-9-9-4z", "M22 2 11 13"],
  flag: ["M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", "M4 22v-7"],
  check: ["M20 6 9 17l-5-5"],
  search: ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z", "m21 21-4.3-4.3"],
  x: ["M18 6 6 18", "m6 6 12 12"],
};

export function TopicTag({ tag }: { tag: ForumTag }) {
  const tr = useTr();
  const m = TAG_META[tag];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingVertical: 3, paddingHorizontal: 8, borderRadius: 100, backgroundColor: m.color + "1F" }}>
      <Icon d={m.icon} size={12} color={m.color} strokeWidth={2.1} />
      <Text style={{ fontSize: 11.5, fontWeight: "700", color: m.color }}>{tr(m.label)}</Text>
    </View>
  );
}

export function UserLine({ user, time, badge }: { user: { name: string; handle: string; avatarColor: string; image: string | null; moderator: boolean }; time: string; badge?: string }) {
  const { colors } = useAppTheme();
  const tr = useTr();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <UserAvatar name={user.name} color={user.avatarColor} imageUrl={user.image} size={32} />
      <View style={{ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "700", color: colors.text, flexShrink: 1 }}>{user.name}</Text>
        {user.moderator && <Badge text={tr("Moderação")} />}
        {badge ? <Badge text={badge} /> : null}
        <Text style={{ fontSize: 12.5, color: colors.textMuted }}>· {time}</Text>
      </View>
    </View>
  );
}

export function Badge({ text, accent }: { text: string; accent?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ paddingVertical: 1.5, paddingHorizontal: 6, borderRadius: 6, backgroundColor: accent ? colors.accentTint : colors.fillSubtle }}>
      <Text style={{ fontSize: 10.5, fontWeight: "700", color: accent ? colors.accent : colors.textSubtle }}>{text}</Text>
    </View>
  );
}

export function LinkedMusicCard({ entity, onPress }: { entity: ForumEntity; onPress?: () => void }) {
  const { colors } = useAppTheme();
  const tr = useTr();
  const kindLabel = entity.kind === "album" ? "Álbum" : entity.kind === "single" ? "Música" : entity.kind === "artist" ? "Artista" : "Clipe";
  const meta = [entity.artist, entity.year].filter(Boolean).join(" · ");
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: colors.divider, backgroundColor: pressed ? colors.fillSubtle : colors.fillInset })}
    >
      {entity.image ? (
        <Image source={{ uri: resolveMediaUrl(entity.image) }} style={{ width: 56, height: 56, borderRadius: entity.kind === "artist" ? 28 : 10 }} />
      ) : (
        <View style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: colors.fillSubtle }} />
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 14.5, fontWeight: "700", color: colors.text }}>{entity.name}</Text>
        {meta ? <Text numberOfLines={1} style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 1 }}>{meta}</Text> : null}
        <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textSubtle, marginTop: 3 }}>{tr(kindLabel)}</Text>
      </View>
    </Pressable>
  );
}

function compact(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);
}

export function TopicCard({ topic, onPress }: { topic: ForumTopic | ForumTopicRemoved; onPress: () => void }) {
  const { colors, lang } = useAppTheme();
  const tr = useTr();

  if (topic.removed) {
    return (
      <View style={{ marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.surface }}>
        <Text style={{ fontSize: 13.5, color: colors.textMuted }}>{tr("Este tópico foi removido.")}</Text>
        <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 3 }}>{tr(topic.removedReason)}</Text>
      </View>
    );
  }

  const label = `${topic.comments} ${tr("respostas")}, ${topic.likes} ${tr("curtidas")}, ${topic.views} ${tr("visualizações")}`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${topic.title}. ${label}`}
      style={({ pressed }) => ({ marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.divider, backgroundColor: pressed ? colors.fillInset : colors.surface, gap: 9 })}
    >
      <UserLine user={topic.author} time={relativeTime(topic.createdAt, lang)} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <TopicTag tag={topic.tag} />
        {topic.pinned && <Badge text={tr("Fixado")} />}
        {topic.closed && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Icon d={ICONS.lock} size={12} color={colors.textMuted} />
            <Text style={{ fontSize: 11.5, color: colors.textMuted, fontWeight: "600" }}>{tr("Fechado")}</Text>
          </View>
        )}
      </View>
      <Text numberOfLines={2} style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.3, color: colors.text, lineHeight: 22 }}>{topic.title}</Text>
      {topic.spoiler ? (
        <Text style={{ fontSize: 13.5, color: colors.textMuted }}>{tr("Contém spoiler. Abra para ler.")}</Text>
      ) : (
        <Text numberOfLines={1} style={{ fontSize: 14, color: colors.textSubtle }}>{topic.excerpt}</Text>
      )}
      {topic.entity && <LinkedMusicCard entity={topic.entity} />}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 2 }}>
        <Stat d={ICONS.reply} n={topic.comments} label={tr("respostas")} />
        <Stat d={ICONS.heart} n={topic.likes} label={tr("curtidas")} color={topic.liked ? colors.accent : undefined} fill={topic.liked} />
        <Stat d={ICONS.eye} n={topic.views} label={tr("visualizações")} />
        <View style={{ flex: 1 }} />
        <Icon d={ICONS.bookmark} size={16} color={topic.saved ? colors.accent : colors.textMuted} fill={topic.saved ? colors.accent : undefined} />
      </View>
    </Pressable>
  );
}

function Stat({ d, n, label, color, fill }: { d: string[]; n: number; label: string; color?: string; fill?: boolean }) {
  const { colors } = useAppTheme();
  const c = color ?? colors.textMuted;
  return (
    <View accessible accessibilityLabel={`${n} ${label}`} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <Icon d={d} size={15} color={c} fill={fill ? c : undefined} />
      <Text style={{ fontSize: 12.5, fontWeight: "600", color: c }}>{compact(n)}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active: boolean; onPress: () => void; icon?: React.ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 36, paddingHorizontal: 13, borderRadius: 100, borderWidth: 1, borderColor: active ? colors.text : colors.divider, backgroundColor: active ? colors.text : colors.surface }}
    >
      {icon}
      <Text style={{ fontSize: 13, fontWeight: "700", color: active ? colors.bg : colors.text }}>{label}</Text>
    </Pressable>
  );
}

export function SkeletonCard() {
  const { colors } = useAppTheme();
  const bar = (w: string | number, h: number) => <View style={{ width: w as any, height: h, borderRadius: 6, backgroundColor: colors.fillSubtle }} />;
  return (
    <View style={{ marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.surface, gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.fillSubtle }} />
        {bar(120, 12)}
      </View>
      {bar(70, 18)}
      {bar("90%", 18)}
      {bar("60%", 12)}
    </View>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: { label: string; onPress: () => void } }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 32, gap: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text, textAlign: "center" }}>{title}</Text>
      {text ? <Text style={{ fontSize: 13.5, color: colors.textMuted, textAlign: "center" }}>{text}</Text> : null}
      {action ? (
        <Pressable onPress={action.onPress} style={{ marginTop: 8, minHeight: 44, paddingHorizontal: 20, borderRadius: 100, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
