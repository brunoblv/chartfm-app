import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { BackHeader } from "../components/BackHeader";
import { useAppTheme } from "../theme/ThemeProvider";
import { useConversationQuery, useSendMessageMutation, useMarkConversationReadMutation, DmMessage } from "../api/conversas";
import { RootStackParamList } from "../navigation/RootNavigator";

type Route = RouteProp<RootStackParamList, "ConversationThread">;

function Bubble({ message }: { message: DmMessage }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ alignSelf: message.mine ? "flex-end" : "flex-start", maxWidth: "78%", marginVertical: 4, marginHorizontal: 16 }}>
      <View
        style={{
          backgroundColor: message.mine ? colors.accent : colors.fillSubtle,
          borderRadius: 16,
          borderBottomRightRadius: message.mine ? 4 : 16,
          borderBottomLeftRadius: message.mine ? 16 : 4,
          paddingVertical: 9,
          paddingHorizontal: 13,
        }}
      >
        <Text style={{ color: message.mine ? "#fff" : colors.text, fontSize: 14.5 }}>{message.text}</Text>
      </View>
    </View>
  );
}

export function ConversationThreadScreen() {
  const { colors } = useAppTheme();
  const route = useRoute<Route>();
  const { conversationId, name } = route.params;
  const query = useConversationQuery(conversationId);
  const sendMutation = useSendMessageMutation(conversationId);
  const markRead = useMarkConversationReadMutation();
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    markRead.mutate(conversationId);
  }, [conversationId]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    sendMutation.mutate(trimmed);
  };

  return (
    <Screen scroll={false}>
      <BackHeader title={name ?? query.data?.other.name ?? "Conversa"} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        {query.isLoading ? (
          <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            ref={listRef}
            data={query.data?.messages ?? []}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <Bubble message={item} />}
            contentContainerStyle={{ paddingVertical: 12, flexGrow: 1, justifyContent: "flex-end" }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.divider }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Escreva uma mensagem…"
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1,
              backgroundColor: colors.fillSubtle,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              color: colors.text,
              fontSize: 14.5,
              maxHeight: 100,
            }}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || sendMutation.isPending}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: text.trim() ? colors.accent : colors.fillSubtle,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: text.trim() ? "#fff" : colors.textMuted, fontWeight: "800", fontSize: 16 }}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
