import React from "react";
import { View, Text, Pressable, TextInput, ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { Toggle } from "../components/Toggle";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useTr } from "../i18n/useTr";
import { resolveMediaUrl } from "../lib/api";
import { useSearchQuery } from "../api/search";
import { ForumCreateInput, ForumTag, forumErrorKey, useForumCategoriesQuery, useForumCreateTopic } from "../api/forum";
import { Chip, ICONS, Icon, LinkedMusicCard, TAG_META } from "../components/forum/ForumParts";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "ForumCreate">;
type Entity = NonNullable<ForumCreateInput["entity"]>;

const TAGS = Object.keys(TAG_META) as ForumTag[];
const MIN = 10;
const MAX = 80;

export function ForumCreateScreen() {
  const tr = useTr();
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const params = useRoute<Route>().params;

  const categories = useForumCategoriesQuery();
  const create = useForumCreateTopic();

  const [categoryId, setCategoryId] = React.useState<string | undefined>(params?.categoryId);
  const [tag, setTag] = React.useState<ForumTag | null>(null);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [spoiler, setSpoiler] = React.useState(false);
  const [entity, setEntity] = React.useState<Entity | null>(null);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [term, setTerm] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  const search = useSearchQuery(term);
  const titleLen = title.trim().length;
  const titleOk = titleLen >= MIN && titleLen <= MAX;
  const valid = !!categoryId && !!tag && titleOk && body.trim().length > 0;
  const dirty = !!(title || body || entity);

  // Confirma a saída quando há texto não enviado.
  React.useEffect(() => {
    return navigation.addListener("beforeRemove", (e) => {
      if (!dirty || create.isSuccess) return;
      e.preventDefault();
      Alert.alert(tr("Descartar tópico?"), tr("O que você escreveu será perdido."), [
        { text: tr("Continuar editando"), style: "cancel" },
        { text: tr("Descartar"), style: "destructive", onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });
  }, [navigation, dirty, create.isSuccess, tr]);

  const publish = () => {
    setTouched(true);
    if (!valid || !categoryId || !tag) return;
    create.mutate(
      { categoryId, tag, title: title.trim(), body: body.trim(), spoiler, entity },
      {
        onSuccess: (t) => navigation.replace("ForumTopic", { topicId: t.id }),
        onError: (e) => Alert.alert(tr("Não foi possível publicar"), tr(forumErrorKey(e))),
      },
    );
  };

  const results: Entity[] = [
    ...(search.data?.songs ?? []).slice(0, 5).map((s): Entity => ({ kind: "single", id: s.id, name: s.title, artist: s.artist, year: null, image: s.coverUrl })),
    ...(search.data?.albums ?? []).slice(0, 5).map((a): Entity => ({ kind: "album", id: String(a.id), name: a.title, artist: a.artist, year: a.year, image: a.coverUrl })),
    ...(search.data?.artists ?? []).slice(0, 4).map((a): Entity => ({ kind: "artist", id: a.spotifyId, name: a.name, artist: null, year: null, image: a.imageUrl })),
  ];
  const kindLabel = (k: string) => (k === "album" ? "Álbum" : k === "single" ? "Música" : "Artista");

  const label = (t: string, req?: boolean) => (
    <Text style={{ fontSize: 13, fontWeight: "800", color: colors.text, marginBottom: 8 }}>
      {t}
      {req ? <Text style={{ color: colors.accent }}> *</Text> : null}
    </Text>
  );
  const err = (t: string) => <Text style={{ fontSize: 12.5, color: colors.accent, marginTop: 6 }}>{t}</Text>;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={tr("Criar tópico")} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 22, paddingBottom: 40 }}>
          <View>
            {label(tr("Categoria"), true)}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {(categories.data ?? []).map((c) => (
                <Chip key={c.id} label={tr(c.name)} active={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
              ))}
            </ScrollView>
            {touched && !categoryId && err(tr("Escolha uma categoria."))}
          </View>

          <View>
            {label(tr("Tipo do tópico"), true)}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {TAGS.map((t) => (
                <Chip
                  key={t}
                  label={tr(TAG_META[t].label)}
                  active={tag === t}
                  onPress={() => setTag(t)}
                  icon={<Icon d={TAG_META[t].icon} size={13} color={tag === t ? colors.bg : TAG_META[t].color} strokeWidth={2.1} />}
                />
              ))}
            </View>
            {touched && !tag && err(tr("Escolha o tipo do tópico."))}
          </View>

          <View>
            {label(tr("Título"), true)}
            <TextInput
              value={title}
              onChangeText={setTitle}
              maxLength={MAX + 20}
              placeholder={tr("Sobre o que é o tópico?")}
              placeholderTextColor={colors.textMuted}
              style={{ borderWidth: 1, borderColor: touched && !titleOk ? colors.accent : colors.divider, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: "700", color: colors.text, backgroundColor: colors.surface }}
            />
            <Text style={{ fontSize: 12, color: titleLen > MAX ? colors.accent : colors.textMuted, marginTop: 6, textAlign: "right" }}>{`${titleLen}/${MAX}`}</Text>
            {touched && !titleOk && err(tr("O título precisa ter entre 10 e 80 caracteres."))}
          </View>

          <View>
            {label(tr("Música, álbum ou artista"))}
            {entity ? (
              <View style={{ gap: 8 }}>
                <LinkedMusicCard entity={entity} />
                <Pressable onPress={() => setEntity(null)} hitSlop={8}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: colors.accent }}>{tr("Remover")}</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Pressable
                  onPress={() => setPickerOpen(true)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 9, minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.divider, paddingHorizontal: 13, backgroundColor: colors.surface }}
                >
                  <Icon d={ICONS.search} size={17} color={colors.textMuted} />
                  <Text style={{ fontSize: 14.5, color: colors.textMuted }}>{tr("Buscar no ChartFM")}</Text>
                </Pressable>
                {pickerOpen && (
                  <View style={{ marginTop: 8, borderRadius: 14, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.surface, overflow: "hidden" }}>
                    <TextInput
                      autoFocus
                      value={term}
                      onChangeText={setTerm}
                      placeholder={tr("Músicas, álbuns, artistas")}
                      placeholderTextColor={colors.textMuted}
                      style={{ paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.divider }}
                    />
                    {search.isFetching ? <ActivityIndicator color={colors.textMuted} style={{ margin: 12 }} /> : null}
                    {term.trim().length >= 2 && !search.isFetching && results.length === 0 && (
                      <Text style={{ padding: 14, fontSize: 13.5, color: colors.textMuted }}>{tr("Nada encontrado.")}</Text>
                    )}
                    {results.map((r) => (
                      <Pressable
                        key={`${r.kind}-${r.id}`}
                        onPress={() => { setEntity(r); setPickerOpen(false); setTerm(""); }}
                        style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 8, minHeight: 56, backgroundColor: pressed ? colors.fillSubtle : "transparent" })}
                      >
                        {r.image ? (
                          <Image source={{ uri: resolveMediaUrl(r.image) }} style={{ width: 40, height: 40, borderRadius: r.kind === "artist" ? 20 : 8 }} />
                        ) : (
                          <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colors.fillSubtle }} />
                        )}
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>{r.name}</Text>
                          <Text numberOfLines={1} style={{ fontSize: 12.5, color: colors.textMuted }}>
                            {[r.artist, r.year].filter(Boolean).join(" · ")}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textSubtle }}>{tr(kindLabel(r.kind))}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>

          <View>
            {label(tr("Texto"), true)}
            <TextInput
              value={body}
              onChangeText={setBody}
              multiline
              maxLength={8000}
              placeholder={tr("O que você quer conversar com a comunidade?")}
              placeholderTextColor={colors.textMuted}
              style={{ minHeight: 160, borderWidth: 1, borderColor: touched && !body.trim() ? colors.accent : colors.divider, borderRadius: 12, padding: 14, fontSize: 16, lineHeight: 24, color: colors.text, backgroundColor: colors.surface, textAlignVertical: "top" }}
            />
            {touched && !body.trim() && err(tr("Escreva o texto do tópico."))}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontSize: 14.5, fontWeight: "700", color: colors.text }}>{tr("Contém spoiler")}</Text>
              <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>{tr("O texto fica escondido até a pessoa tocar para ler.")}</Text>
            </View>
            <Toggle on={spoiler} onToggle={() => setSpoiler(!spoiler)} />
          </View>

          <Text style={{ fontSize: 12.5, color: colors.textMuted }}>
            {tr("Ao publicar, você concorda em manter a conversa respeitosa. Spam, ataques pessoais e links de download serão removidos.")}
          </Text>

          <Pressable
            onPress={publish}
            disabled={create.isPending}
            accessibilityRole="button"
            style={{ minHeight: 50, borderRadius: 100, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", opacity: create.isPending ? 0.7 : valid || !touched ? 1 : 0.85 }}
          >
            {create.isPending ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15.5 }}>{tr("Publicar tópico")}</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
