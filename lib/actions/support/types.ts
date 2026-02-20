/**
 * Types for support tickets and chat (schema v1.2.4).
 * Collections: ticket, chat_session, messages
 */

export type TicketStatus = "Open" | "In_Progress" | "Resolved" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export type TicketRecord = {
  id: string;
  customer?: string;
  assigned_to?: string;
  subject?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  accepted?: boolean;
  relatedOrderid?: string;
  created?: string;
  updated?: string;
  expand?: {
    customer?: { id: string; name?: string; email?: string };
    assigned_to?: { id: string; name?: string; email?: string };
    relatedOrderid?: Record<string, unknown>;
  };
};

export type ChatSessionStatus = "Open" | "Close";
export type ChatType = "support" | "client_customer";
export type ServiceType = "CFS" | "Transport" | "3PL" | "Warehouse";

export type ChatSessionRecord = {
  id: string;
  user?: string;
  agent?: string;
  status?: ChatSessionStatus;
  closed_at?: string;
  chatType?: ChatType;
  client?: string;
  customer?: string;
  subject?: string;
  serviceType?: ServiceType;
  lastMessageAt?: string;
  relatedOrderid?: string;
  ticket?: string;
  typingUserId?: string[];
  created?: string;
  updated?: string;
  expand?: {
    customer?: { id: string; name?: string; firstname?: string; lastname?: string };
    agent?: { id: string; name?: string };
    client?: { id: string; name?: string; firstname?: string; lastname?: string };
    ticket?: TicketRecord;
    relatedOrderid?: Record<string, unknown>;
  };
};

export type MessageType = "text" | "file";

export type MessageRecord = {
  id: string;
  chat: string;
  sender?: string;
  content?: string;
  attachments?: string;
  isRead?: boolean;
  readAt?: string;
  messageType?: MessageType;
  created?: string;
  updated?: string;
  expand?: {
    chat?: ChatSessionRecord;
    sender?: { id: string; name?: string; firstname?: string; lastname?: string; avatar?: string };
  };
};
