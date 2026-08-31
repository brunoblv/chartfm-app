import React from "react";
import { View, Text, Pressable, ScrollView, Image, Alert } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { SuggestedPerson } from "../../api/homeHub";
import { useFollowMutation } from "../../api/profile";
import { resolveMediaUrl } from "../../lib/api";

export function PeopleToMeetRow({ people, onPress }: { people: SuggestedPerson[]; onPress: (handle: string) => void }) {
  const { colors } = useAppTheme();
  const followMutation = useFollowMutation();
  if (people.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
      {people.map((p) => (
        <View
          key={p.id}
          style={{
            width: 132,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.divider,
            borderRadius: 16,
            padding: 16,
            alignItems: "center",
          }}
        >
          <Pressable onPress={() => onPress(p.handle)}>
            {p.image ? (
              <Image source={{ uri: resolveMediaUrl(p.image) }} style={{ width: 52, height: 52, borderRadius: 26 }} />
            ) : (
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: p.avatarColor, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>{p.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </Pressable>
          <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 10 }}>
            {p.name}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
            {p.commonGenres.length > 0 ? `${p.commonGenres.length} gêneros em comum` : `${p.chartsPublished} paradas`}
          </Text>
          <Pressable
            disabled={followMutation.isPending}
            onPress={() =>
              followMutation.mutate(p.id, {
                onError: () => Alert.alert("Não foi possível seguir", "Tente novamente."),
              })
            }
            style={{ marginTop: 11, backgroundColor: colors.accent, borderRadius: 100, paddingVertical: 9, width: "100%", alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>Seguir</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
