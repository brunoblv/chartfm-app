import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useAppTheme } from "../theme/ThemeProvider";
import {
  LibraryItemType,
  LibrarySource,
  useLibrarySavedQuery,
  useToggleLibraryMutation,
} from "../api/library";

export function SaveLibraryButton({
  itemType,
  itemId,
  source,
}: {
  itemType: LibraryItemType;
  itemId: string | number | undefined;
  source: LibrarySource;
}) {
  const { colors } = useAppTheme();
  const id = itemId == null ? undefined : String(itemId);
  const query = useLibrarySavedQuery(itemType, id);
  const mutation = useToggleLibraryMutation();
  const saved = query.data?.saved === true;

  if (!id) return null;

  const busy = query.isLoading || mutation.isPending;

  return (
    <Pressable
      disabled={busy}
      onPress={() => mutation.mutate({ itemType, itemId: id, saved, source })}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 100,
        backgroundColor: saved ? colors.accentTint : colors.fillSubtle,
        marginTop: 12,
      }}
    >
      {busy ? (
        <ActivityIndicator size="small" color={saved ? colors.accent : colors.textMuted} />
      ) : (
        <Svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill={saved ? colors.accent : "none"}
          stroke={saved ? colors.accent : colors.textMuted}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </Svg>
      )}
      <Text style={{ fontSize: 12.5, fontWeight: "700", color: saved ? colors.accent : colors.text }}>
        {saved ? "Salvo" : "Salvar"}
      </Text>
    </Pressable>
  );
}
