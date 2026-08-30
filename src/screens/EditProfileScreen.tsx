import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { AuthField } from "../components/AuthField";
import { PillButton } from "../components/PillButton";
import { useAuth } from "../state/AuthContext";
import { useProfileQuery } from "../api/profile";
import { useUpdateHandleMutation, useUpdateGenresMutation, accountErrorMessage, GENRE_OPTIONS } from "../api/account";

export function EditProfileScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();
  const profileQuery = useProfileQuery(user?.handle);
  const updateHandle = useUpdateHandleMutation();
  const updateGenres = useUpdateGenresMutation();

  const [name, setName] = useState(user?.name ?? "");
  const [handle, setHandle] = useState(user?.handle ?? "");
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    if (profileQuery.data?.genres) setGenres(profileQuery.data.genres);
  }, [profileQuery.data?.genres]);

  const toggleGenre = (g: string) => {
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const isSaving = updateHandle.isPending || updateGenres.isPending;

  const handleSave = async () => {
    if (isSaving) return;
    try {
      if (handle !== user?.handle || name !== user?.name) {
        await updateHandle.mutateAsync({ handle: handle.toLowerCase().trim(), name: name.trim() || undefined });
      }
      await updateGenres.mutateAsync(genres);
      await refreshUser();
      Alert.alert("Perfil atualizado", "Suas informações foram salvas.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Não foi possível salvar", accountErrorMessage(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Editar perfil" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View style={{ gap: 12, marginBottom: 24 }}>
          <AuthField label="Nome" value={name} onChangeText={setName} />
          <AuthField label="@handle" value={handle} onChangeText={(v) => setHandle(v.toLowerCase().replace(/[^a-z0-9_]/g, ""))} />
        </View>

        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 10 }}>Gêneros favoritos</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {GENRE_OPTIONS.map((g) => {
            const active = genres.includes(g);
            return (
              <Pressable
                key={g}
                onPress={() => toggleGenre(g)}
                style={{
                  backgroundColor: active ? colors.accent : colors.fillSubtle,
                  borderRadius: 100,
                  paddingVertical: 9,
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ color: active ? "#fff" : colors.textSubtle, fontWeight: "700", fontSize: 13 }}>{g}</Text>
              </Pressable>
            );
          })}
        </View>

        <PillButton label="Salvar" onPress={handleSave} loading={isSaving} />
      </ScrollView>
    </View>
  );
}
