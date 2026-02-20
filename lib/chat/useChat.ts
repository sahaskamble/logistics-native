import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentUser } from "@/lib/actions/users";
import {
  getChatSession,
  listMessagesPaginated,
  markAllUnreadAsReadInChat,
  sendMessageWithFile,
  subscribeToChatMessages,
  subscribeToChatSession,
  type ChatSessionRecord,
  type MessageRecord,
} from "@/lib/actions/support";

const PAGE_SIZE = 50;

export function useChat(sessionId: string | undefined) {
  const user = getCurrentUser();
  const currentUserId = user.user?.id;

  const [chatSession, setChatSession] = useState<ChatSessionRecord | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [sending, setSending] = useState(false);

  const pageRef = useRef(1);
  const unsubMessagesRef = useRef<(() => void) | null>(null);
  const unsubSessionRef = useRef<(() => void) | null>(null);

  const loadSession = useCallback(async () => {
    if (!sessionId || !currentUserId) return;
    const res = await getChatSession(sessionId);
    if (res.success && res.output) {
      setChatSession(res.output);
    } else {
      setError(res.message ?? "Failed to load chat");
    }
  }, [sessionId, currentUserId]);

  const loadMessages = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!sessionId) return;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      const res = await listMessagesPaginated(sessionId, page, PAGE_SIZE);
      if (res.success && res.output) {
        const { items, hasMore: more } = res.output;
        if (append) {
          setMessages((prev) => [...items, ...prev]);
        } else {
          setMessages(items);
        }
        setHasMore(more);
        pageRef.current = page;
      } else {
        setError(res.message ?? "Failed to load messages");
      }
      setLoading(false);
      setLoadingMore(false);
    },
    [sessionId]
  );

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || !sessionId) return;
    loadMessages(pageRef.current + 1, true);
  }, [loadingMore, hasMore, sessionId, loadMessages]);

  const markAsRead = useCallback(async () => {
    if (sessionId) await markAllUnreadAsReadInChat(sessionId);
  }, [sessionId]);

  const sendMessage = useCallback(
    async (content: string, file?: { uri: string; name: string; type: string }) => {
      if (!sessionId || !currentUserId) return;
      const trimmed = (content ?? "").trim();
      if (!trimmed && !file?.uri) return;

      const tempId = `temp-${Date.now()}`;
      const optimistic: MessageRecord = {
        id: tempId,
        chat: sessionId,
        sender: currentUserId,
        content: trimmed || undefined,
        messageType: file ? "file" : "text",
        isRead: false,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        expand: {
          sender: {
            id: currentUserId,
            name: user.user?.name,
            firstname: user.user?.firstname,
            lastname: user.user?.lastname,
          },
        },
      };
      setMessages((prev) => [...prev, optimistic]);
      setSending(true);
      const res = await sendMessageWithFile({
        chat: sessionId,
        content: trimmed || undefined,
        file,
      });
      setSending(false);
      if (res.success && res.output) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? res.output! : m))
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setError(res.message ?? "Failed to send");
      }
    },
    [sessionId, currentUserId, user.user]
  );

  useEffect(() => {
    if (!sessionId || !currentUserId) {
      setLoading(false);
      setChatSession(null);
      setMessages([]);
      return;
    }
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      await loadSession();
      if (!mounted) return;
      await loadMessages(1, false);
      if (!mounted) return;
      await markAllUnreadAsReadInChat(sessionId);
    })();
    return () => {
      mounted = false;
    };
  }, [sessionId, currentUserId, loadSession, loadMessages]);

  useEffect(() => {
    if (!sessionId || !currentUserId) return;
    unsubMessagesRef.current = subscribeToChatMessages(sessionId, (action, record) => {
      if (action === "create") {
        if (record.sender !== currentUserId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === record.id)) return prev;
            return [...prev, record];
          });
        }
      } else if (action === "update") {
        setMessages((prev) =>
          prev.map((m) => (m.id === record.id ? record : m))
        );
      } else if (action === "delete") {
        setMessages((prev) => prev.filter((m) => m.id !== record.id));
      }
    });
    unsubSessionRef.current = subscribeToChatSession(sessionId, (record) => {
      setChatSession(record);
    });
    return () => {
      unsubMessagesRef.current?.();
      unsubSessionRef.current?.();
      unsubMessagesRef.current = null;
      unsubSessionRef.current = null;
    };
  }, [sessionId, currentUserId]);

  return {
    chatSession,
    messages,
    loading,
    loadingMore,
    error,
    hasMore,
    sending,
    currentUserId,
    loadSession,
    loadMessages: () => loadMessages(1, false),
    loadMore,
    markAsRead,
    sendMessage,
  };
}
