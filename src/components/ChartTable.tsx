import React from "react";
import { View, ViewStyle } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";
import { SongRow } from "./SongRow";
import { ChartSong } from "../data/mock";

export interface ChartTableEntry {
  key: string;
  song: ChartSong;
  position?: number;
  meta?: string;
  onPress?: () => void;
  accessory?: React.ReactNode;
}

/**
 * Tabela de parada padrão (mesmo visual do Global 100), usada em todo lugar que
 * lista músicas rankeadas — evita reimplementações divergentes por tela.
 */
export function ChartTable({ entries, style }: { entries: ChartTableEntry[]; style?: ViewStyle }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        {
          marginHorizontal: 16,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.divider,
          borderRadius: 16,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {entries.map((e, i) => (
        <SongRow
          key={e.key}
          song={e.song}
          position={e.position}
          meta={e.meta}
          last={i === entries.length - 1}
          onPress={e.onPress}
          accessory={e.accessory}
        />
      ))}
    </View>
  );
}
