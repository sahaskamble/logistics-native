import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import type { ChatSessionRecord, MessageRecord } from "./types";
import type { PbQueryOptions } from "@/lib/actions/pbOptions";

const CHAT_COLLECTION = "chat_session";
const MESSAGES_COLLECTION = "messages";

/**
 * List chat sessions for the current user (as customer, agent, or client).
 * Schema rules: customer = @request.auth.id || agent = @request.auth.id || client = @request.auth.id
 */
export async function listChatSessionsForCurrentUser(options?: PbQueryOptions): Promise<{
  success: boolean;
  message: string;
  output: ChatSessionRecord[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }
    const records = await pb.collection(CHAT_COLLECTION).getFullList<ChatSessionRecord>({
      ...options,
      sort: options?.sort ?? "-lastMessageAt",
      expand: options?.expand ?? "customer,agent,client,ticket",
    });
    return { success: true, message: "Fetched chat sessions.", output: records };
  } catch (err: unknown) {
    const e = err as { status?: number; data?: { message?: string }; message?: string };
    const details = e?.data?.message ?? e?.message;
    const message = e?.status
      ? `Failed to fetch chats (HTTP ${e.status}). ${details ?? ""}`.trim()
      : (details as string) ?? "Failed to fetch chat sessions.";
    return { success: false, message, output: [] };
  }
}

/**
 * Get a single chat session. Same auth rules as list.
 */
export async function getChatSession(id: string, options?: { expand?: string }): Promise<{
  success: boolean;
  message: string;
  output: ChatSessionRecord | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const record = await pb.collection(CHAT_COLLECTION).getOne<ChatSessionRecord>(id, {
      expand: options?.expand ?? "customer,agent,client,ticket,relatedOrderid",
    });
    return { success: true, message: "Fetched chat.", output: record };
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string };
    return {
      success: false,
      message: (e?.data?.message ?? e?.message) as string ?? "Failed to fetch chat.",
      output: null,
    };
  }
}

export type CreateChatSessionParams = {
  subject?: string;
  chatType?: ChatSessionRecord["chatType"];
  serviceType?: ChatSessionRecord["serviceType"];
  ticket?: string;
  relatedOrderid?: string;
};

/**
 * Create a support or client_customer chat session.
 * Backend createRule for chat_session is empty in schema; if needed add e.g. customer = @request.auth.id for support.
 */
export async function createChatSession(params: CreateChatSessionParams): Promise<{
  success: boolean;
  message: string;
  output: ChatSessionRecord | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const record = await pb.collection(CHAT_COLLECTION).create<ChatSessionRecord>({
      customer: user.user.id,
      subject: params.subject?.trim() ?? "",
      chatType: params.chatType ?? "support",
      serviceType: params.serviceType,
      ticket: params.ticket?.trim() || undefined,
      relatedOrderid: params.relatedOrderid?.trim() || undefined,
      status: "Open",
    } as Record<string, unknown>);
    return { success: true, message: "Chat started.", output: record };
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string };
    return {
      success: false,
      message: (e?.data?.message ?? e?.message) as string ?? "Failed to start chat.",
      output: null,
    };
  }
}

/**
 * List messages for a chat. Auth: chat.customer/agent/client = @request.auth.id
 */
export async function listMessages(chatId: string, options?: PbQueryOptions): Promise<{
  success: boolean;
  message: string;
  output: MessageRecord[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }
    const filter = options?.filter
      ? `chat = "${chatId}" && (${options.filter})`
      : `chat = "${chatId}"`;
    const records = await pb.collection(MESSAGES_COLLECTION).getFullList<MessageRecord>({
      ...options,
      filter,
      sort: options?.sort ?? "created",
      expand: options?.expand ?? "sender",
    });
    return { success: true, message: "Fetched messages.", output: records };
  } catch (err: unknown) {
    const e = err as { status?: number; data?: { message?: string }; message?: string };
    const details = e?.data?.message ?? e?.message;
    return {
      success: false,
      message: (details as string) ?? "Failed to fetch messages.",
      output: [],
    };
  }
}

export type SendMessageParams = {
  chat: string;
  content?: string;
  messageType?: MessageRecord["messageType"];
};

/**
 * Send a text message. Schema: sender = @request.auth.id && participant in chat.
 */
export async function sendMessage(params: SendMessageParams): Promise<{
  success: boolean;
  message: string;
  output: MessageRecord | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    if (!params.chat?.trim()) {
      return { success: false, message: "Chat ID is required.", output: null };
    }
    const record = await pb.collection(MESSAGES_COLLECTION).create<MessageRecord>({
      chat: params.chat.trim(),
      sender: user.user.id,
      content: (params.content ?? "").trim() || undefined,
      messageType: params.messageType ?? "text",
      isRead: false,
    } as Record<string, unknown>);
    // Optionally update chat_session.lastMessageAt (if backend doesn’t do it via hook)
    try {
      await pb.collection(CHAT_COLLECTION).update(params.chat.trim(), {
        lastMessageAt: new Date().toISOString(),
      } as Record<string, unknown>);
    } catch {
      // ignore
    }
    return { success: true, message: "Message sent.", output: record };
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string };
    return {
      success: false,
      message: (e?.data?.message ?? e?.message) as string ?? "Failed to send message.",
      output: null,
    };
  }
}

/**
 * Mark messages in a chat as read. updateRule allows participants (except sender) to update.
 */
export async function markChatMessagesAsRead(chatId: string, messageIds: string[]): Promise<void> {
  const user = getCurrentUser();
  if (!user.isValid || !user.user?.id || messageIds.length === 0) return;
  const now = new Date().toISOString();
  await Promise.all(
    messageIds.map((id) =>
      pb.collection(MESSAGES_COLLECTION).update(id, { isRead: true, readAt: now } as Record<string, unknown>)
    )
  );
}

/**
 * Subscribe to new messages in a chat (realtime). Call returned unsubscribe to clean up.
 */
export function subscribeToChatMessages(
  chatId: string,
  onRecord: (action: "create" | "update" | "delete", record: MessageRecord) => void
): () => void {
  const handler = (e: { action: string; record: MessageRecord }) => {
    if (e.record?.chat === chatId) {
      onRecord(e.action as "create" | "update" | "delete", e.record);
    }
  };
  pb.collection(MESSAGES_COLLECTION).subscribe("*", handler);
  return () => {
    pb.collection(MESSAGES_COLLECTION).unsubscribe("*");
  };
}

/**
 * Subscribe to chat_session updates (e.g. status, lastMessageAt, typingUserId). Call returned fn to clean up.
 */
export function subscribeToChatSession(
  chatId: string,
  onUpdate: (record: ChatSessionRecord) => void
): () => void {
  const handler = (e: { action: string; record: ChatSessionRecord }) => {
    if (e.record?.id === chatId) {
      onUpdate(e.record);
    }
  };
  pb.collection(CHAT_COLLECTION).subscribe(chatId, handler);
  return () => {
    pb.collection(CHAT_COLLECTION).unsubscribe(chatId);
  };
}

const MESSAGES_PAGE_SIZE = 50;

/**
 * List messages with pagination. Newest first from API, returns chronological order for UI.
 * Schema: sort -created, then reverse items.
 */
export async function listMessagesPaginated(
  chatId: string,
  page: number = 1,
  perPage: number = MESSAGES_PAGE_SIZE
): Promise<{
  success: boolean;
  message: string;
  output: { items: MessageRecord[]; totalItems: number; hasMore: boolean };
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: { items: [], totalItems: 0, hasMore: false } };
    }
    const result = await pb.collection(MESSAGES_COLLECTION).getList<MessageRecord>(page, perPage, {
      filter: `chat = "${chatId}"`,
      sort: "-created",
      expand: "sender",
    });
    const items = (result.items ?? []).reverse();
    const totalItems = result.totalItems ?? 0;
    const hasMore = totalItems > page * perPage;
    return {
      success: true,
      message: "Fetched messages.",
      output: { items, totalItems, hasMore },
    };
  } catch (err: unknown) {
    const e = err as { status?: number; data?: { message?: string }; message?: string };
    return {
      success: false,
      message: (e?.data?.message ?? e?.message) as string ?? "Failed to fetch messages.",
      output: { items: [], totalItems: 0, hasMore: false },
    };
  }
}

/**
 * Get or create a chat session for a support ticket. Returns existing session if one exists for this ticket.
 */
export async function getOrCreateTicketChatSession(ticketId: string): Promise<{
  success: boolean;
  message: string;
  output: ChatSessionRecord | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const existing = await pb.collection(CHAT_COLLECTION).getList<ChatSessionRecord>(1, 1, {
      filter: `ticket = "${ticketId}"`,
      expand: "customer,agent,client,ticket",
    });
    if (existing.items?.length) {
      return { success: true, message: "Fetched ticket chat.", output: existing.items[0] };
    }
    const record = await pb.collection(CHAT_COLLECTION).create<ChatSessionRecord>({
      customer: user.user.id,
      ticket: ticketId,
      chatType: "support",
      subject: "Ticket chat",
      status: "Open",
    } as Record<string, unknown>);
    return { success: true, message: "Ticket chat started.", output: record };
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string };
    return {
      success: false,
      message: (e?.data?.message ?? e?.message) as string ?? "Failed to get or create ticket chat.",
      output: null,
    };
  }
}

/**
 * Create client_customer chat or return existing (duplicate prevention per doc).
 */
export async function createClientCustomerChatSession(params: {
  clientId: string;
  subject?: string;
  serviceType?: ChatSessionRecord["serviceType"];
}): Promise<{ success: boolean; message: string; output: ChatSessionRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const customerId = user.user.id;
    const clientId = params.clientId?.trim();
    if (!clientId) {
      return { success: false, message: "Client is required.", output: null };
    }
    const existing = await pb.collection(CHAT_COLLECTION).getList<ChatSessionRecord>(1, 1, {
      filter: `chatType = "client_customer" && ((customer = "${customerId}" && client = "${clientId}") || (customer = "${clientId}" && client = "${customerId}"))`,
      sort: "-lastMessageAt",
      expand: "customer,client",
    });
    if (existing.items?.length) {
      return { success: true, message: "Fetched existing chat.", output: existing.items[0] };
    }
    const record = await pb.collection(CHAT_COLLECTION).create<ChatSessionRecord>({
      chatType: "client_customer",
      customer: customerId,
      client: clientId,
      subject: (params.subject ?? "").trim() || "General inquiry",
      serviceType: params.serviceType,
      status: "Open",
    } as Record<string, unknown>);
    return { success: true, message: "Chat started.", output: record };
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string };
    return {
      success: false,
      message: (e?.data?.message ?? e?.message) as string ?? "Failed to start chat.",
      output: null,
    };
  }
}

/**
 * Fetch unread message IDs in this chat (sent by others). Then use markChatMessagesAsRead(chatId, ids).
 */
export async function fetchUnreadMessageIdsInChat(chatId: string): Promise<string[]> {
  const user = getCurrentUser();
  if (!user.isValid || !user.user?.id) return [];
  try {
    const result = await pb.collection(MESSAGES_COLLECTION).getList<MessageRecord>(1, 100, {
      filter: `chat = "${chatId}" && sender != "${user.user.id}" && isRead = false`,
      fields: "id",
    });
    return (result.items ?? []).map((m) => m.id);
  } catch {
    return [];
  }
}

/**
 * Mark all unread messages in this chat (from others) as read.
 */
export async function markAllUnreadAsReadInChat(chatId: string): Promise<void> {
  const ids = await fetchUnreadMessageIdsInChat(chatId);
  if (ids.length) await markChatMessagesAsRead(chatId, ids);
}

export type SendMessageWithFileParams = {
  chat: string;
  content?: string;
  /** File from picker: { uri, name, type } or FormData appendable */
  file?: { uri: string; name: string; type: string };
};

const SEND_MESSAGE_RETRIES = 3;
const SEND_MESSAGE_BACKOFF_MS = 1000;

/**
 * Send a message (text and/or file). Uses FormData when file is present. Retries on 5xx/network.
 */
export async function sendMessageWithFile(params: SendMessageWithFileParams): Promise<{
  success: boolean;
  message: string;
  output: MessageRecord | null;
}> {
  const user = getCurrentUser();
  if (!user.isValid || !user.user?.id) {
    return { success: false, message: "User not authenticated.", output: null };
  }
  if (!params.chat?.trim()) {
    return { success: false, message: "Chat ID is required.", output: null };
  }
  const hasContent = (params.content ?? "").trim().length > 0;
  const hasFile = !!params.file?.uri;
  if (!hasContent && !hasFile) {
    return { success: false, message: "Message must have content or attachment.", output: null };
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < SEND_MESSAGE_RETRIES; attempt++) {
    try {
      if (hasFile && params.file) {
        const fd = new FormData();
        fd.append("chat", params.chat.trim());
        fd.append("sender", user.user.id);
        fd.append("content", (params.content ?? "").trim());
        fd.append("messageType", "file");
        fd.append("isRead", "false");
        (fd as any).append("attachments", {
          uri: params.file.uri,
          name: params.file.name,
          type: params.file.type,
        });
        const record = await pb.collection(MESSAGES_COLLECTION).create<MessageRecord>(fd as any);
        try {
          await pb.collection(CHAT_COLLECTION).update(params.chat.trim(), {
            lastMessageAt: new Date().toISOString(),
          } as Record<string, unknown>);
        } catch {
          // ignore
        }
        return { success: true, message: "Message sent.", output: record };
      }
      const record = await pb.collection(MESSAGES_COLLECTION).create<MessageRecord>({
        chat: params.chat.trim(),
        sender: user.user.id,
        content: (params.content ?? "").trim() || undefined,
        messageType: "text",
        isRead: false,
      } as Record<string, unknown>);
      try {
        await pb.collection(CHAT_COLLECTION).update(params.chat.trim(), {
          lastMessageAt: new Date().toISOString(),
        } as Record<string, unknown>);
      } catch {
        // ignore
      }
      return { success: true, message: "Message sent.", output: record };
    } catch (err: unknown) {
      lastError = err;
      const e = err as { status?: number };
      if (e?.status != null && e.status >= 400 && e.status < 500) break;
      if (attempt < SEND_MESSAGE_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, SEND_MESSAGE_BACKOFF_MS * Math.pow(2, attempt)));
      }
    }
  }
  const e = lastError as { data?: { message?: string }; message?: string };
  return {
    success: false,
    message: (e?.data?.message ?? (e as Error)?.message) as string ?? "Failed to send message.",
    output: null,
  };
}
