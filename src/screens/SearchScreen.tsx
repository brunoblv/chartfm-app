import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Image } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useSearchQuery } from "../api/search";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS = ["Músicas", "Artistas", "Pessoas"] as const;

function Avatar({ uri, label, color }: { uri: string | null; label: string; color?: string }) {
  if (uri) return <Image source={{ uri }} style={{ width: 44, height: 44, borderRadius: 22 }} />;
  return (
    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color ?? "#8BC34A", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>{label.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

export function SearchScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Músicas");

  const { data, isLoading, isFetching } = useSearchQuery(query);
  const hasQuery = query.trim().length >= 2;
  const total = (data?.songs.length ?? 0) + (data?.artists.length ?? 0) + (data?.users.length ?? 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 14 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}
        >
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round">
            <Path d="M15 18l-6-6 6-6" />
          </Svg>
        </Pressable>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.fillSubtle, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 13 }}>
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2} strokeLinecap="round">
            <Circle cx={11} cy={11} r={7} />
            <Path d="M20 20l-3.5-3.5" />
          </Svg>
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            style={{ flex: 1, fontSize: 14.5, fontWeight: "600", color: colors.text, padding: 0 }}
            placeholder="músicas, artistas, pessoas"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      {!hasQuery ? (
        <View style={{ flex: 1, alignItems: "center", paddingTop: 80, paddingHorizontal: 40 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.fillSubtle, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.textDisabled} strokeWidth={1.8} strokeLinecap="round">
              <Circle cx={11} cy={11} r={7} />
              <Path d="M20 20l-3.5-3.5" />
            </Svg>
          </View>
          <Text style={{ fontSize: 17, fontWeight: "700", letterSpacing: -0.3, color: colors.text }}>Buscar no ChartFM</Text>
          <Text style={{ fontSize: 13.5, color: colors.textMuted, lineHeight: 19, marginTop: 8, textAlign: "center", maxWidth: 250 }}>
            Digite pelo menos 2 letras para procurar músicas, artistas ou pessoas.
          </Text>
        </View>
      ) : isLoading ? (
        <View style={{ paddingTop: 60, alignItems: "center" }}>
          <ActivityIndicator color={colors.text} />
        </View>
      ) : total === 0 ? (
        <View style={{ flex: 1, alignItems: "center", paddingTop: 80, paddingHorizontal: 40 }}>
          <Text style={{ fontSize: 17, fontWeight: "700", letterSpacing: -0.3, color: colors.text }}>Nada encontrado</Text>
          <Text style={{ fontSize: 13.5, color: colors.textMuted, lineHeight: 19, marginTop: 8, textAlign: "center", maxWidth: 250 }}>
            Não achamos nada para "{query}". Tente outro termo.
          </Text>
        </View>
      ) : (
        <ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            {TABS.map((t) => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={{ backgroundColor: t === tab ? colors.btnDarkBg : colors.fillSubtle, borderRadius: 100, paddingVertical: 9, paddingHorizontal: 14, marginRight: 8 }}
              >
                <Text style={{ color: t === tab ? colors.btnDarkFg : colors.textSubtle, fontWeight: "700", fontSize: 13 }}>{t}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {isFetching && <ActivityIndicator color={colors.textMuted} style={{ marginBottom: 12 }} />}

          {tab === "Artistas" ? (
            <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
              {(data?.artists ?? []).map((a, i) => (
                <View
                  key={a.id}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderBottomWidth: i === (data?.artists.length ?? 0) - 1 ? 0 : 1, borderBottomColor: colors.dividerSoft }}
                >
                  <Avatar uri={a.imageUrl} label={a.name} />
                  <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>{a.name}</Text>
                </View>
              ))}
              {(data?.artists.length ?? 0) === 0 && (
                <Text style={{ padding: 16, fontSize: 13, color: colors.textMuted }}>Nenhum artista encontrado.</Text>
              )}
            </View>
          ) : tab === "Pessoas" ? (
            <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
              {(data?.users ?? []).map((u, i) => (
                <Pressable
                  key={u.handle}
                  onPress={() => navigation.navigate("UserDetail", { handle: u.handle })}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderBottomWidth: i === (data?.users.length ?? 0) - 1 ? 0 : 1, borderBottomColor: colors.dividerSoft }}
                >
                  <Avatar uri={u.image} label={u.name || u.handle} color={u.avatarColor} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>{u.name}</Text>
                    <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>@{u.handle}</Text>
                  </View>
                </Pressable>
              ))}
              {(data?.users.length ?? 0) === 0 && (
                <Text style={{ padding: 16, fontSize: 13, color: colors.textMuted }}>Ninguém encontrado.</Text>
              )}
            </View>
          ) : (
            <View style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: 16, overflow: "hidden" }}>
              {(data?.songs ?? []).map((s, i) => (
                <Pressable
                  key={s.id}
                  onPress={() => navigation.navigate("MusicDetail")}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderBottomWidth: i === (data?.songs.length ?? 0) - 1 ? 0 : 1, borderBottomColor: colors.dividerSoft }}
                >
                  {s.coverUrl ? (
                    <Image source={{ uri: s.coverUrl }} style={{ width: 44, height: 44, borderRadius: 10 }} />
                  ) : (
                    <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: colors.fillSubtle }} />
                  )}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                      {s.title}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
                      {s.artist}
                    </Text>
                  </View>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textDisabled} strokeWidth={2.2} strokeLinecap="round">
                    <Path d="M9 6l6 6-6 6" />
                  </Svg>
                </Pressable>
              ))}
              {(data?.songs.length ?? 0) === 0 && (
                <Text style={{ padding: 16, fontSize: 13, color: colors.textMuted }}>Nenhuma música encontrada.</Text>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
