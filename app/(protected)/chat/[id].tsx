import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Linking,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft, Paperclip, Send } from "lucide-react-native";
import { useChat } from "@/lib/chat/useChat";
import type { MessageRecord } from "@/lib/actions/support";
import pb from "@/lib/pocketbase/pb";
import { TextInput } from "react-native";

function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

function MessageBubble({
  message,
  isMine,
  showSender,
}: {
  message: MessageRecord;
  isMine: boolean;
  showSender: boolean;
}) {
  const senderName =
    message.expand?.sender?.name ??
    ([message.expand?.sender?.firstname, message.expand?.sender?.lastname].filter(Boolean).join(" ") || "User");
  const attachmentUrl =
    message.attachments && message.messageType === "file"
      ? pb.files.getURL(message as any, message.attachments, { token: pb.authStore.token })
      : null;

  return (
    <View className={`flex-row mb-2 ${isMine ? "justify-end" : "justify-start"}`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isMine
            ? "bg-primary rounded-br-md"
            : "bg-muted border border-border rounded-bl-md"
        }`}
      >
        {!isMine && showSender && (
          <Text className="text-xs font-medium text-muted-foreground mb-0.5">
            {senderName}
          </Text>
        )}
        {message.content ? (
          <Text className={isMine ? "text-primary-foreground" : "text-foreground"}>
            {message.content}
          </Text>
        ) : null}
        {attachmentUrl && (
          <TouchableOpacity
            onPress={() => attachmentUrl && Linking.openURL(attachmentUrl)}
            className="mt-2 flex-row items-center gap-1"
          >
            <Icon as={Paperclip} size={14} className={isMine ? "text-primary-foreground" : "text-foreground"} />
            <Text
              className={`text-sm underline ${isMine ? "text-primary-foreground" : "text-foreground"}`}
              numberOfLines={1}
            >
              Attachment
            </Text>
          </TouchableOpacity>
        )}
        <Text
          className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/80" : "text-muted-foreground"}`}
        >
          {formatTime(message.created)}
        </Text>
      </View>
    </View>
  );
}

export default function ChatRoomPage() {
  const { id: sessionId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const {
    chatSession,
    messages,
    loading,
    loadingMore,
    error,
    hasMore,
    sending,
    currentUserId,
    loadMore,
    sendMessage,
  } = useChat(sessionId);

  const handleSend = useCallback(() => {
    const t = inputText.trim();
    if (!t && !sending) return;
    setInputText("");
    sendMessage(t);
  }, [inputText, sending, sendMessage]);

  const renderMessage = useCallback(
    ({ item, index }: { item: MessageRecord; index: number }) => {
      const isMine = item.sender === currentUserId;
      const prev = messages[index - 1];
      const showSender = !prev || prev.sender !== item.sender;
      return (
        <MessageBubble
          message={item}
          isMine={!!isMine}
          showSender={showSender}
        />
      );
    },
    [currentUserId, messages]
  );

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) loadMore();
  }, [hasMore, loadingMore, loadMore]);

  if (!sessionId) {
    return (
      <>
        <Stack.Screen options={{ title: "Chat" }} />
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-muted-foreground">Invalid chat.</Text>
          <Button variant="outline" className="mt-4" onPress={() => router.back()}>
            <Text>Go back</Text>
          </Button>
        </View>
      </>
    );
  }

  if (loading && !chatSession) {
    return (
      <>
        <Stack.Screen options={{ title: "Chat" }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="text-muted-foreground mt-2">Loading chat...</Text>
        </View>
      </>
    );
  }

  const headerTitle =
    chatSession?.subject ||
    (chatSession?.ticket ? "Ticket chat" : "Chat");

  return (
    <>
      <Stack.Screen
        options={{
          title: headerTitle,
          headerLeft: () => (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.back()}
              className="rounded-full"
            >
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />
      <View style={{ flex: 1 }} className={`bg-background ${keyboardHeight > 0 ? 'pb-0' : 'pb-8'}`}>
        {error ? (
          <View className="px-4 py-2 bg-destructive/10">
            <Text className="text-sm text-destructive">{error}</Text>
          </View>
        ) : null}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexGrow: 1,
            paddingBottom: keyboardHeight > 0 ? 8 : 0,
          }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={
            hasMore && !loading ? (
              <TouchableOpacity
                onPress={handleLoadMore}
                className="py-2 items-center"
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text className="text-xs text-muted-foreground">Load older messages</Text>
                )}
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View className="py-8 items-center">
                <Text className="text-muted-foreground">No messages yet. Say hello!</Text>
              </View>
            ) : null
          }
        />

        <View
          style={{ paddingBottom: keyboardHeight }}
          className="flex-row items-end gap-2 px-3 py-2 border-t border-border bg-background"
        >
          <TextInput
            className="flex-1 min-h-[50px] max-h-28 rounded-xl border border-input bg-muted/50 px-4 py-2 text-foreground"
            placeholder="Type a message..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!sending}
            onSubmitEditing={() => {
              Keyboard.dismiss();
              handleSend();
            }}
            submitBehavior={"blurAndSubmit"}
          />
          <Button
            size="icon"
            className="rounded-full h-10 w-10"
            onPress={() => {
              Keyboard.dismiss();
              handleSend();
            }}
            disabled={sending || (!inputText.trim())}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon as={Send} size={20} className="text-primary-foreground" />
            )}
          </Button>
        </View>
      </View>
    </>
  );
}
