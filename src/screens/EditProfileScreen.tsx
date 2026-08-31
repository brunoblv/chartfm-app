import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Alert, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { AuthField } from "../components/AuthField";
import { PillButton } from "../components/PillButton";
import { useAuth } from "../state/AuthContext";
import { useProfileQuery } from "../api/profile";
import {
  useUpdateHandleMutation,
  useUpdateGenresMutation,
  useUploadAvatarMutation,
  useDeleteAvatarMutation,
  accountErrorMessage,
  GENRE_OPTIONS,
} from "../api/account";
import { resolveMediaUrl } from "../lib/api";

export function EditProfileScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();
  const profileQuery = useProfileQuery(user?.handle);
  const updateHandle = useUpdateHandleMutation();
  const updateGenres = useUpdateGenresMutation();
  const uploadAvatar = useUploadAvatarMutation();
  const deleteAvatar = useDeleteAvatarMutation();

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
  const isAvatarBusy = uploadAvatar.isPending || deleteAvatar.isPending;

  const handlePickAvatar = async () => {
    if (isAvatarBusy) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Autorize o acesso às fotos para trocar seu avatar.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const extension = asset.uri.split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeByExt: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

    uploadAvatar.mutate(
      { uri: asset.uri, name: `avatar.${extension}`, type: mimeByExt[extension] ?? "image/jpeg" },
      {
        onSuccess: () => refreshUser(),
        onError: (e) => Alert.alert("Não foi possível enviar a foto", accountErrorMessage(e)),
      }
    );
  };

  const handleRemoveAvatar = () => {
    if (isAvatarBusy) return;
    Alert.alert("Remover foto", "Deseja remover sua foto de perfil?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () =>
          deleteAvatar.mutate(undefined, {
            onSuccess: () => refreshUser(),
            onError: (e) => Alert.alert("Não foi possível remover a foto", accountErrorMessage(e)),
          }),
      },
    ]);
  };

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
        <View style={{ alignItems: "center", marginBottom: 26 }}>
          <Pressable onPress={handlePickAvatar} disabled={isAvatarBusy} style={{ width: 88, height: 88 }}>
            {profileQuery.data?.imageUrl ? (
              <Image source={{ uri: resolveMediaUrl(profileQuery.data.imageUrl) }} style={{ width: 88, height: 88, borderRadius: 44 }} />
            ) : (
              <LinearGradient colors={[colors.gradientHero[0], colors.gradientHero[1]]} style={{ width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 34 }}>
                  {(user?.name ?? user?.handle ?? "?").charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            {isAvatarBusy && (
              <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 44, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </Pressable>
          <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
            <Pressable onPress={handlePickAvatar} disabled={isAvatarBusy}>
              <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 13 }}>Trocar foto</Text>
            </Pressable>
            {profileQuery.data?.imageUrl && (
              <Pressable onPress={handleRemoveAvatar} disabled={isAvatarBusy}>
                <Text style={{ color: colors.textMuted, fontWeight: "600", fontSize: 13 }}>Remover</Text>
              </Pressable>
            )}
          </View>
        </View>

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
