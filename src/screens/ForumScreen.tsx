import React from "react";
import { View, Text, Pressable, FlatList, ScrollView, TextInput, ActivityIndicator, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useTr } from "../i18n/useTr";
import { useAuth } from "../state/AuthContext";
import { useDebouncedValue } from "../api/search";
import {
  ForumSort,
  ForumTag,
  useForumCategoriesQuery,
  useForumTagsQuery,
  useForumTopicsQuery,
} from "../api/forum";
import { Chip, EmptyState, ICONS, Icon, SkeletonCard, TAG_ICON_PATHS, TopicCard } from "../components/forum/ForumParts";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SORTS: { id: ForumSort; label: string }[] = [
  { id: "hot", label: "Em alta" },
  { id: "recent", label: "Recentes" },
  { id: "top", label: "Mais curtidos" },
  { id: "unanswered", label: "Sem respostas" },
];

export function ForumScreen() {
  const tr = useTr();
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { isSignedIn } = useAuth();

  const [sort, setSort] = React.useState<ForumSort>("hot");
  const [category, setCategory] = React.useState<string | undefined>(undefined);
  const [tag, setTag] = React.useState<ForumTag | null>(null);
  const [search, setSearch] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const q = useDebouncedValue(search.trim(), 350);

  const categories = useForumCategoriesQuery();
  const tagsQuery = useForumTagsQuery();
  const topics = useForumTopicsQuery({ category, tag, sort, q: q.length >= 2 ? q : undefined });
  const items = topics.data?.pages.flatMap((p) => p.topics) ?? [];
  const activeCat = categories.data?.find((c) => c.id === category);

  const goCreate = () => {
    if (!isSignedIn) return navigation.navigate("Login");
    navigation.navigate("ForumCreate", { categoryId: category });
  };

  const header = (
    <View>
      <View style={{ paddingHorizontal: 16, paddingTop: 2 }}>
        <Text style={{ fontSize: 11.5, fontWeight: "800", letterSpacing: 1, color: colors.accent }}>{tr("COMUNIDADE")}</Text>
        <Text style={{ fontSize: 30, fontWeight: "800", letterSpacing: -0.8, color: colors.text }}>{tr("Fórum")}</Text>
        <Text style={{ fontSize: 14, color: colors.textSubtle, marginTop: 3 }}>
          {tr("Converse sobre música, lançamentos e tudo que está movimentando a comunidade.")}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.fillSubtle, borderRadius: 12, paddingHorizontal: 13, minHeight: 44 }}>
          <Icon d={ICONS.search} size={17} color={colors.textMuted} strokeWidth={2} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearching(true)}
            placeholder={tr("Buscar tópicos, artistas, álbuns...")}
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={tr("Buscar no fórum")}
            returnKeyType="search"
            style={{ flex: 1, fontSize: 14.5, color: colors.text, paddingVertical: 10 }}
          />
          {search ? (
            <Pressable onPress={() => { setSearch(""); setSearching(false); }} accessibilityLabel={tr("Limpar busca")} hitSlop={10}>
              <Icon d={ICONS.x} size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 14 }}>
        {SORTS.map((s) => (
          <Chip key={s.id} label={tr(s.label)} active={sort === s.id} onPress={() => setSort(s.id)} />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 10 }}>
        <Chip label={tr("Todas")} active={!category} onPress={() => setCategory(undefined)} />
        {(categories.data ?? []).map((c) => (
          <Chip key={c.id} label={tr(c.name)} active={category === c.id} onPress={() => setCategory(category === c.id ? undefined : c.id)} />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 }}>
        <Chip label={tr("Todos")} active={!tag} onPress={() => setTag(null)} />
        {(tagsQuery.data ?? []).map((t) => (
          <Chip
            key={t.id}
            label={t.label}
            active={tag === t.id}
            onPress={() => setTag(tag === t.id ? null : t.id)}
            icon={<Icon d={TAG_ICON_PATHS[t.icon] ?? TAG_ICON_PATHS.tag} size={13} color={tag === t.id ? colors.bg : t.color} strokeWidth={2.1} />}
          />
        ))}
      </ScrollView>

      {activeCat ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <Text style={{ fontSize: 13, color: colors.textSubtle }}>{tr(activeCat.desc)}</Text>
          <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>
            {`${activeCat.topics} ${tr("tópicos")} · ${activeCat.activeToday} ${tr("ativos hoje")}`}
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader
        action={
          isSignedIn ? (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <HeaderPill label={tr("Meus tópicos")} onPress={() => navigation.navigate("ForumList", { mode: "mine" })} />
              <HeaderPill label={tr("Salvos")} onPress={() => navigation.navigate("ForumList", { mode: "saved" })} />
            </View>
          ) : undefined
        }
      />
      <FlatList
        data={topics.isLoading ? [] : items}
        keyExtractor={(t) => t.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => <TopicCard topic={item} onPress={() => !item.removed && navigation.navigate("ForumTopic", { topicId: item.id })} />}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={topics.isRefetching && !topics.isFetchingNextPage} onRefresh={() => topics.refetch()} tintColor={colors.textMuted} />}
        onEndReachedThreshold={0.6}
        onEndReached={() => topics.hasNextPage && !topics.isFetchingNextPage && topics.fetchNextPage()}
        ListEmptyComponent={
          topics.isLoading ? (
            <View>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : topics.isError ? (
            <EmptyState
              title={tr("Sem conexão")}
              text={tr("Não foi possível carregar o fórum agora.")}
              action={{ label: tr("Tentar novamente"), onPress: () => topics.refetch() }}
            />
          ) : q.length >= 2 ? (
            <EmptyState title={tr("Nada encontrado")} text={tr("Tente outro termo ou escolha uma categoria.")} />
          ) : (
            <EmptyState
              title={tr("Nenhum tópico por aqui ainda")}
              text={tr("Seja a primeira pessoa a puxar assunto.")}
              action={{ label: tr("Criar tópico"), onPress: goCreate }}
            />
          )
        }
        ListFooterComponent={topics.isFetchingNextPage ? <ActivityIndicator color={colors.textMuted} style={{ margin: 16 }} /> : <View style={{ height: 96 }} />}
      />
      <Pressable
        onPress={goCreate}
        accessibilityRole="button"
        accessibilityLabel={tr("Criar tópico")}
        style={({ pressed }) => ({ position: "absolute", right: 18, bottom: 22, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.85 : 1, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 })}
      >
        <Icon d={ICONS.plus} size={26} color="#fff" strokeWidth={2.4} />
      </Pressable>
    </SafeAreaView>
  );
}

function HeaderPill({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} style={{ minHeight: 34, paddingHorizontal: 12, borderRadius: 100, backgroundColor: colors.fillInset, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 12.5, fontWeight: "700", color: colors.text }}>{label}</Text>
    </Pressable>
  );
}

/** Lista simples para "Meus tópicos" e "Salvos". */
export function ForumListScreen({ route }: { route: { params: { mode: "mine" | "saved" } } }) {
  const tr = useTr();
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const mode = route.params.mode;
  const topics = useForumTopicsQuery({ mine: mode === "mine", saved: mode === "saved", sort: "recent" });
  const items = topics.data?.pages.flatMap((p) => p.topics) ?? [];
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={mode === "mine" ? tr("Meus tópicos") : tr("Salvos")} />
      <FlatList
        data={items}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <TopicCard topic={item} onPress={() => !item.removed && navigation.navigate("ForumTopic", { topicId: item.id })} />}
        onEndReached={() => topics.hasNextPage && !topics.isFetchingNextPage && topics.fetchNextPage()}
        ListEmptyComponent={
          topics.isLoading ? (
            <ActivityIndicator color={colors.textMuted} style={{ marginTop: 40 }} />
          ) : (
            <EmptyState title={mode === "mine" ? tr("Você ainda não criou nenhum tópico") : tr("Nenhum tópico salvo")} />
          )
        }
      />
    </SafeAreaView>
  );
}
