import React from "react";
import { View, Text, Pressable, ViewStyle } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";
import { Cover } from "./Cover";
import { PositionNumber } from "./PositionNumber";
import { MovementBadge, MovementStatus } from "./MovementBadge";
import { ChartSong } from "../data/mock";

export function SongRow({
  song,
  position,
  meta,
  compact,
  last,
  onPress,
  onArtistPress,
  accessory,
  style,
}: {
  song: ChartSong;
  position?: number;
  meta?: string;
  compact?: boolean;
  last?: boolean;
  onPress?: () => void;
  /** Quando presente, o nome do artista vira um alvo de toque próprio (leva pra página dele). */
  onArtistPress?: () => void;
  /** Conteúdo extra à direita (ex.: botões de remover/arrastar do editor). */
  accessory?: React.ReactNode;
  /** Sobrescreve estilo do container (ex.: destaque durante drag no editor). */
  style?: ViewStyle;
}) {
  const { colors } = useAppTheme();
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 11,
          paddingHorizontal: 14,
          borderBottomWidth: last ? 0 : 1,
          borderBottomColor: colors.dividerSoft,
        },
        style,
      ]}
    >
      {position != null && <PositionNumber n={position} size={20} />}
      <Cover cover={song.cover} size={44} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
          {song.t}
        </Text>
        {onArtistPress ? (
          <Pressable onPress={onArtistPress} hitSlop={4}>
            <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
              {song.a}
            </Text>
          </Pressable>
        ) : (
          <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
            {song.a}
          </Text>
        )}
        {meta ? (
          <Text style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 3 }}>{meta}</Text>
        ) : null}
      </View>
      {song.mv ? <MovementBadge status={song.mv as MovementStatus} delta={song.d} compact={compact} /> : null}
      {accessory}
    </Wrapper>
  );
}
