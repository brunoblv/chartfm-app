import React from "react";
import { View, Text, Pressable, ActivityIndicator, Image, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useAppTheme } from "../theme/ThemeProvider";
import { useConversationsQuery, DmPreview } from "../api/conversas";
import { resolveMediaUrl } from "../lib/api";
import { RootStackParamList } from "../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function Row({ conversation, navigation }: { conversation: DmPreview; navigation: Nav }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={() =>
        navigation.navigate("ConversationThread", { conversationId: conversation.id, handle: conversation.other.handle, name: conversation.other.name })
      }
      style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}
    >
      {conversation.other.image ? (
        <Image source={{ uri: resolveMediaUrl(conversation.other.image) }} style={{ width: 48, height: 48, borderRadius: 24 }} />
      ) : (
        <LinearGradient colors={["#8BC34A", "#CDDC39"]} style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>{conversation.other.name.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 14.5, fontWeight: "700", color: colors.text }}>
          {conversation.other.name}
        </Text>
        <Text numberOfLines={1} style={{ fontSize: 12.5, color: conversation.unread > 0 ? colors.text : colors.textMuted, marginTop: 1 }}>
          {conversation.lastText}
        </Text>
      </View>
      {conversation.unread > 0 && (
        <View style={{ minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 }}>
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>{conversation.unread}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function ConversasScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const query = useConversationsQuery();

  return (
    <Screen scroll={false}>
      <BackHeader title="Mensagens" />
      {query.isLoading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
      ) : (query.data?.conversations.length ?? 0) === 0 ? (
        <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 40, paddingHorizontal: 30 }}>
          Nenhuma conversa ainda. Envie uma mensagem a partir do perfil de alguém.
        </Text>
      ) : (
        <FlatList
          data={query.data!.conversations}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <Row conversation={item} navigation={navigation} />}
        />
      )}
    </Screen>
  );
}
