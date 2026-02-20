# LinkMyLogistics Chat System - Complete Documentation

## Overview
The LinkMyLogistics webapp has a comprehensive chat system built with **PocketBase** as the backend, organized into three main chat types:
1. **Support Chat** (GOL support with customers/merchants)
2. **Client-Customer Chat** (Direct communication between customers and clients)
3. **Ticket Chat** (Chat sessions linked to support tickets)

---

## Database Schema (PocketBase)

### 1. `chat_session` Collection

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | text (15) | ✓ | Auto-generated unique ID |
| `user` | relation → users | ✗ | User who initiated (for GOL support) |
| `agent` | relation → users | ✗ | Assigned GOL staff member |
| `client` | relation → users | ✗ | Client user (for client_customer chats) |
| `customer` | relation → users | ✗ | Customer user |
| `subject` | text | ✗ | Chat subject/topic |
| `chatType` | select | ✗ | `"support"` or `"client_customer"` |
| `serviceType` | select | ✗ | `CFS`, `Transport`, `3PL`, `Warehouse` |
| `status` | select | ✗ | `Open`, `Close`, `Active`, `Pending`, `Rejected` |
| `lastMessageAt` | date | ✗ | Timestamp of last message |
| `relatedOrderid` | relation → cfs_orders/transport_orders/etc | ✗ | Linked order |
| `ticket` | relation → tickets | ✗ | Linked support ticket |
| `typingUserId` | relation → users (multiple) | ✗ | Users currently typing |
| `created` | autodate | ✓ | Creation timestamp |
| `updated` | autodate | ✓ | Last update timestamp |
| `closed_at` | date | ✗ | When chat was closed |

**Indexes:**
```sql
CREATE INDEX idx_created ON chat_session (created);
CREATE INDEX idx_ticket ON chat_session (ticket);
CREATE INDEX idx_status ON chat_session (status);
CREATE INDEX idx_chatType ON chat_session (chatType);
CREATE INDEX idx_customer ON chat_session (customer);
CREATE INDEX idx_client ON chat_session (client);
CREATE INDEX idx_lastMessageAt ON chat_session (lastMessageAt);
CREATE INDEX idx_chatType_customer ON chat_session (chatType, customer);
CREATE INDEX idx_chatType_client ON chat_session (chatType, client);
CREATE INDEX idx_ticket_status ON chat_session (ticket, status);
```

**Access Rules:**
- **List/View:** `customer = @request.auth.id || agent = @request.auth.id || client = @request.auth.id`
- **Create:** Empty (no restriction)
- **Update:** `(customer = @request.auth.id || agent = @request.auth.id || client = @request.auth.id) && status != "Close"`
- **Delete:** Root or GOLMod only

---

### 2. `messages` Collection

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | text (15) | ✓ | Auto-generated unique ID |
| `chat` | relation → chat_session | ✓ | Parent chat session |
| `sender` | relation → users | ✓ | Message sender |
| `content` | text | ✗ | Message text content |
| `attachments` | file (max 1) | ✗ | File attachment |
| `isRead` | bool | ✗ | Whether message marked as read |
| `readAt` | date | ✗ | When message was read |
| `messageType` | select | ✗ | `"text"` or `"file"` |
| `created` | autodate | ✓ | Creation timestamp |
| `updated` | autodate | ✓ | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_chat ON messages (chat);
CREATE INDEX idx_created ON messages (created);
CREATE INDEX idx_chat_created ON messages (chat, created);
CREATE INDEX idx_sender ON messages (sender);
CREATE INDEX idx_isRead ON messages (isRead);
CREATE INDEX idx_chat_sender_isRead ON messages (chat, sender, isRead);
```

**Access Rules:**
- **List/View:** `chat.customer = @request.auth.id || chat.agent = @request.auth.id || chat.client = @request.auth.id`
- **Create:** `sender = @request.auth.id && (chat.customer = @request.auth.id || chat.agent = @request.auth.id || chat.client = @request.auth.id)`
- **Update:** `(chat.customer = @request.auth.id || chat.agent = @request.auth.id || chat.client = @request.auth.id) && sender != @request.auth.id`
- **Delete:** `sender = @request.auth.id || @request.auth.role = "Root" || @request.auth.role = "GOLMod"`

**File Upload Constraints:**
- Max file size: 10MB
- Allowed types: `image/jpeg`, `image/png`, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

---

## Service Layer Architecture

### 1. `chatService.js` - GOL Support Chat

**Purpose:** Handles GOL support interactions with customers and merchants

**Key Methods:**

```javascript
// Create new support chat session
createChatSession(userId, userRole, orderInfo)

// Load chat session with messages
getChatSession(sessionId, userId)

// Send message (text or file attachment)
sendMessage(sessionId, senderId, content, attachment)

// Close chat session
closeChatSession(sessionId, userId)

// Get user's chat sessions
getUserChatSessions(userId)

// Get all chat sessions (for agents)
getAllChatSessions()

// Assign agent to session
assignAgentToSession(sessionId, agentId)

// Subscribe to real-time updates
subscribeToChat(sessionId, onMessage, onSessionUpdate)
unsubscribeFromChat()

// Search FAQs for auto-responses
searchFAQs(query)
```

**Auto-Assignment Logic:**
- When a customer creates a chat, automatically assigns a GOL staff member
- Priority: GOLMod > GOLStaff (FIFO assignment)
- Sends welcome message from assigned agent

---

### 2. `customerClientChatService.js` - Client-Customer Chat

**Purpose:** Direct messaging between customers and clients (service providers)

**Key Methods:**

```javascript
// Create chat session (checks if one exists first)
createChatSession(customerId, clientId, subject, serviceType)

// Close chat session
closeChatSession(sessionId, userId)

// Get chat sessions for a user
getChatSessions(userId, userType) // userType = 'customer' | 'client'

// Get chat with paginated messages
getChatSession(sessionId, userId, page, perPage)

// Send message with retry logic
sendMessage(sessionId, senderId, content, attachment)

// Mark messages as read
markMessagesAsRead(sessionId, userId)

// Get unread count
getUnreadMessageCount(userId, userType)

// Accept/reject pending chat requests
acceptChatRequest(sessionId, clientId)
rejectChatRequest(sessionId, clientId, reason)

// Real-time subscriptions
subscribeToChat(sessionId, onMessage, onSessionUpdate)
subscribeToNewChatSessions(clientId, onNewSession)
unsubscribeFromChat()

// Search messages
searchMessages(sessionId, searchTerm)
```

**Key Features:**

1. **Duplicate Chat Prevention:** Checks for existing sessions before creating new one
   ```javascript
   filter: `chatType = "client_customer" && ((customer = "${customerId}" && client = "${clientId}") || (customer = "${clientId}" && client = "${customerId}"))`
   ```

2. **Retry Logic for Message Sending:**
   - 3 retries with exponential backoff
   - Skips client errors (4xx)
   - Handles network timeouts gracefully

3. **Message Pagination:**
   - 50 messages per page
   - Newest first for pagination
   - Returns chronological order to UI

4. **Read Receipts:**
   - Auto-marks messages as read when loading
   - Updates `isRead` and `readAt` timestamps

---

### 3. `ticketChatService.js` - Ticket Support Chat

**Purpose:** Chat sessions linked to support tickets

**Key Methods:**

```javascript
// Create/retrieve chat for a ticket
createTicketChatSession(ticketId, customerId, golId)
getTicketChatSession(ticketId)

// Get/send messages
getTicketChatMessages(sessionId)
sendTicketMessage(sessionId, senderId, content, attachment)

// Close ticket chat
closeTicketChatSession(sessionId)

// Real-time subscriptions
subscribeToTicketChat(sessionId, onMessage, onSessionUpdate)
unsubscribeFromTicketChat()
```

---

## React Hook: `useChat.js`

**Purpose:** Manages chat state, real-time updates, and actions

**State:**
```javascript
{
  chatSession,      // Current session object
  messages,         // Array of messages
  loading,          // Loading state
  error,            // Error message
  isConnected,      // Real-time connection status
  typingUsers       // Set of users currently typing
}
```

**Actions:**

```javascript
// Create new chat
createChatSession(orderInfo)

// Load existing chat
loadChatSession(id)

// Send message
sendMessage(content, attachment)

// Close chat
closeChatSession()

// Handle typing indicators
handleTyping(isTyping)

// Get sessions
getUserChatSessions()
getAllChatSessions()

// Assign agent
assignAgentToSession(sessionId, agentId)

// Search FAQs
searchFAQs(query)

// Subscribe to new sessions (for agents)
subscribeToNewChatSessions(onNewSession)
unsubscribeFromNewChatSessions()
```

**Key Behaviors:**

1. **Optimistic Updates:** Adds new messages to local state immediately
2. **Duplicate Prevention:** Filters out own messages from real-time events
3. **Auto-Scroll:** Scrolls to bottom when new messages arrive
4. **Typing Indicators:** Tracks typing state with 3-second timeout
5. **Auto-Cleanup:** Unsubscribes and clears timeouts on unmount

---

## UI Components

### 1. `ChatWindow.jsx` - Main Chat Interface

**Props:**
```javascript
{
  session,              // Chat session object
  messages,             // Array of messages
  currentUser,          // Current user object
  onSendMessage,        // (content: string, attachment: File) => Promise
  onLoadMore,           // (page: number, perPage: number) => Promise
  onMarkAsRead,         // () => Promise
}
```

**UI Structure:**
```
┌─────────────────────────────────────┐
│  Chat Header                        │
│  ┌───┬─────────────┬────────────┐   │
│  │👤│ User Name    │ 📞 📱 ⋮   │   │
│  │   │ Service Type│            │   │
│  │   │ Status      │            │   │
│  └───┴─────────────┴────────────┘   │
│  Subject: [optional]                 │
├─────────────────────────────────────┤
│  Messages Area                      │
│  ┌─────────────────────────────┐   │
│  │ ☐ Loading more...           │   │
│  ├─────────────────────────────┤   │
│  │ 👤: Message bubble          │   │
│  │         (white, left)       │   │
│  ├─────────────────────────────┤   │
│  │                  👤: Msg    │   │
│  │        (blue, right)       │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Attachment Preview (if any)        │
├─────────────────────────────────────┤
│  Message Input                      │
│  ┌─┬─────────────────────┬───────┐ │
│  │📎│ Type message...     │  ➤  │ │
│  └─┴─────────────────────┴───────┘ │
└─────────────────────────────────────┘
```
**Key Features:**

1. **Message Bubbles:**
   - My messages: Right-aligned, blue background
   - Other messages: Left-aligned, white background with border
   - Avatars shown only when message sender changes (grouping)

2. **Timestamps:**
   - Shown at bottom-right of each bubble
   - HH:mm format

3. **File Attachments:**
   - Displayed as clickable link with paperclip icon
   - Shows filename

4. **Scroll Handling:**
   - Auto-scrolls to bottom when new messages arrive (if near bottom)
   - Manual scroll to top triggers "load more"

5. **Message Grouping:**
   - Consecutive messages from same sender are visually grouped
   - Avatar shown only for first message in group

6. **Status Display:**
   - Service type badge with color-coded icon
   - Status indicator (Open/Close/Active/Pending)

---

### 2. `ChatSessionList.jsx` - Session List

**Props:**
```javascript
{
  sessions,              // Array of chat sessions
  selectedSession,       // Currently selected session
  onSessionSelect,       // (session) => void
  currentUserId,         // Current user ID
}
```

**UI Structure:**
```
┌─────────────────────────────────┐
│ ┌────┬──────────────┬────────┐ │
│ │ 📦 │ John Doe     │ ● 2h   │ │
│ │    │ CFS          │        │ │
│ │    │ Subject...   │ Active │ │
│ └────┴──────────────┴────────┘ │
│ ┌────┬──────────────┬────────┐ │
│ │ 🚚 │ Jane Smith   │        │ │
│ │    │ Transport    │        │ │
│ │    │ No msgs yet  │ Open   │ │
│ └────┴──────────────┴────────┘ │
└─────────────────────────────────┘
```

**Key Features:**

1. **Time Formatting:**
   - `< 1h`: "Just now" or "Xm ago"
   - `1-24h`: "Xh ago"
   - `24-48h`: "Yesterday"
   - `>48h`: Date string

2. **Unread Indicator:**
   - Blue dot (●) for unread sessions
   - Bold text for unread subject

3. **Service Type Badges:**
   - CFS: Blue icons
   - Transport: Green icons
   - 3PL: Purple icons
   - Warehouse: Orange icons

4. **Active Session Highlight:**
   - Blue background
   - Right border indicator

---

### 3. `NewChatModal.jsx` - Start New Chat

**Props:**
```javascript
{
  onClose,               // () => void
  onCreateChat           // (clientId, subject, serviceType) => void
}
```

**Multi-Step Flow:**
```
Step 1: Select Client            Step 2: Chat Details
┌─────────────────────┐         ┌─────────────────────┐
│ 🔍 Search...        │         │ 👤 Selected Client  │
│                     │         │ John Doe            │
│ ┌─────┬──────────┐ │         │ john@example.com    │
│ │ 👤  │ John Doe │ │         │ [Change]            │
│ └─────┴──────────┘ │         ├─────────────────────┤
│ ┌─────┬──────────┐ │         │ Service Type:       │
│ │ 👤  │ Jane...  │ │         │ [CFS][Transport]    │
│ └─────┴──────────┘ │         │ [3PL][Warehouse]    │
│                     │         ├─────────────────────┤
│                     │         │ Subject: *          │
│                     │         │ [Type subject...]   │
│                     │         ├─────────────────────┤
│                     │         │ [Back]  [Start Chat]│
│ └─────────────────────┘         └─────────────────────┘
```

**Key Features:**

1. **Client Search:**
   - Search by name, username, or email
   - Filters users with role = "Client"

2. **Service Type Selection:**
   - Optional but recommended
   - Visual grid with icons

3. **Client Selection:**
   - Shows client avatar, name, email
   - Can go back to change selection

---

## Data Flow Diagrams

### Creating a Chat Session

```
User Action: Click "New Chat"
         ↓
NewChatModal Component
         ↓
Select Client (search users with role="Client")
         ↓
Enter Subject + Service Type
         ↓
onCreateChat(clientId, subject, serviceType)
         ↓
customerClientChatService.createChatSession()
         ↓
Check for existing session (PocketBase query)
         ↓
If exists → Return existing session
If not exists → Create new record in chat_session
         ↓
Redirect to ChatWindow with session ID
         ↓
ChatWindow loads messages
         ↓
subscribeToChat() → Real-time updates enabled
```

### Sending a Message

```
User: Type message + Click Send
         ↓
ChatWindow.onSendMessage(content, attachment)
         ↓
Optimistic UI update (add to local state)
         ↓
customerClientChatService.sendMessage()
         ↓
Validate: Has content OR attachment?
         ↓
If file: Create FormData with file
If text: Create message object
         ↓
PocketBase: messages.create()
         ↓
Retry logic: 3 attempts with exponential backoff
         ↓
Update chat_session.lastMessageAt
         ↓
Real-time: PocketBase broadcasts to all subscribers
         ↓
Other clients: receive via subscribeToChat()
         ↓
UI: Add message to messages array
```

### Real-time Message Updates

```
Message Created in PocketBase
         ↓
PocketBase broadcasts event
         ↓
All subscribed clients receive event
         ↓
Handler checks: e.record.chat === currentSessionId?
         ↓
If yes → Add message to state
           ↓
           Check: Is it my message?
           ↓
           If yes → Ignore (already there)
           If no → Add to messages array
                 ↓
                 Auto-scroll to bottom
```

---

## Real-Time Subscription Patterns

### 1. Chat Message Subscription

```javascript
// In customerClientChatService.js
subscribeToChat(sessionId, onMessage, onSessionUpdate) {
  // Subscribe to messages for this chat
  this.pb.collection('messages').subscribe('*', (e) => {
    if (e.record.chat === sessionId) {
      onMessage(e);  // Pass to UI handler
    }
  });

  // Subscribe to session updates
  this.pb.collection('chat_session').subscribe(sessionId, (e) => {
    onSessionUpdate(e);
  });

  this.activeSubscriptions.add('messages');
  this.activeSubscriptions.add('chat_session');
}
```

**Handler in useChat.js:**
```javascript
const onMessage = (event) => {
  if (event.action === 'create') {
    // Don't add own messages (already added optimistically)
    if (event.record.sender !== user?.id) {
      setMessages(prev => [...prev, event.record]);
    }
  } else if (event.action === 'update') {
    // Update message (e.g., read status)
    setMessages(prev => prev.map(msg =>
      msg.id === event.record.id ? event.record : msg
    ));
  } else if (event.action === 'delete') {
    // Remove message
    setMessages(prev => prev.filter(msg => msg.id !== event.record.id));
  }
};
```

### 2. New Chat Session Subscription (for Clients)

```javascript
// For clients to receive new chat requests
subscribeToNewChatSessions(clientId, onNewSession) {
  this.pb.collection('chat_session').subscribe('*', (e) => {
    if (
      e.action === 'create' &&
      e.record.chatType === 'client_customer' &&
      e.record.client === clientId
    ) {
      onNewSession(e);  // Show notification
    }
  });
}
```

### 3. Unsubscription

```javascript
unsubscribeFromChat() {
  if (this.activeSubscriptions.has('messages')) {
    this.pb.collection('messages').unsubscribe();
  }
  if (this.activeSubscriptions.has('chat_session')) {
    this.pb.collection('chat_session').unsubscribe();
  }
  this.activeSubscriptions.clear();
}
```

---

## Pagination Strategy

### Client-Side Pagination (customerClientChatService)

```javascript
async getChatSession(sessionId, userId, page = 1, perPage = 50) {
  // Load newest first
  const result = await this.pb.collection('messages').getList(page, perPage, {
    filter: `chat = "${sessionId}"`,
    sort: '-created',  // Newest first
  });

  // Reverse to chronological order for UI
  return {
    messages: result.items.reverse(),
    totalPages: Math.ceil(result.totalItems / perPage),
    hasMore: page < totalPages
  };
}
```

### Loading More Messages (UI)

```javascript
// In ChatWindow.jsx
const loadMoreMessages = async () => {
  if (isLoadingMore || !hasMoreMessages) return;

  const nextPage = Math.ceil(messages.length / 50) + 1;
  const { messages: newMessages, pagination } = await onLoadMore(nextPage, 50);

  // Save scroll position
  const oldScrollHeight = container.scrollHeight;

  // Prepend new messages (they're older)
  setMessages(prev => [...newMessages, ...prev]);

  // Restore scroll position after render
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight - oldScrollHeight;
  });
};
```

**Scroll to Load Pattern:**
1. Detect when user scrolls to top
2. Trigger loadMoreMessages()
3. Append older messages to the beginning
4. Maintain scroll position so user doesn't jump

---

## File Upload Handling

### Uploading with Message

```javascript
async sendMessage(sessionId, senderId, content, attachment = null) {
  if (attachment) {
    // Validate file size
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (attachment.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(attachment.type)) {
      throw new Error('Unsupported file type');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('chat', sessionId);
    formData.append('sender', senderId);
    formData.append('content', content || '');
    formData.append('attachments', attachment.file || attachment);
    formData.append('messageType', 'file');

    return await this.pb.collection('messages').create(formData);
  }
  // ... handle text-only messages
}
```

### File Display in Message

```jsx
{message.attachment && (
  <div className="mt-2">
    <a
      href={message.attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center text-xs text-blue-500 hover:underline"
    >
      <Paperclip size={12} className="mr-1" />
      {message.attachment.name}
    </a>
  </div>
)}
```

---

## Read Receipts

### Automatic Mark as Read

```javascript
// When loading chat session
async getChatSession(sessionId, userId, page, perPage) {
  // ... fetch messages

  // Mark unread messages as read
  if (messages.length > 0) {
    const unreadMessages = messages.filter(
      msg => !msg.isRead && msg.sender !== userId
    );

    if (unreadMessages.length > 0) {
      await this.markMessagesAsRead(sessionId, userId);
    }
  }
}
```

### Mark Messages as Read

```javascript
async markMessagesAsRead(sessionId, userId) {
  // Get unread messages
  const unreadMessages = await this.pb.collection('messages').getList(1, 100, {
    filter: `chat = "${sessionId}" && sender != "${userId}" && isRead = false`
  });

  // Mark each as read
  for (const message of unreadMessages.items) {
    await this.pb.collection('messages').update(message.id, {
      isRead: true,
      readAt: new Date().toISOString()
    });
  }

  console.log(`Marked ${unreadMessages.items.length} messages as read`);
}
```

---

## Typing Indicators

### In useChat.js

```javascript
const handleTyping = useCallback((isTyping) => {
  if (!chatSession || !user) return;

  if (isTyping) {
    setTypingUsers(prev => new Set([...prev, user.id]));

    // Clear after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }, 3000);
  } else {
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(user.id);
      return newSet;
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }
}, [chatSession, user]);
```

**Note:** The current implementation tracks typing locally. For cross-device typing indicators, you'd need to:
1. Send typing events via a separate collection or update chat_session.typingUserId
2. Subscribe to session updates to receive typing events
3. Display "X is typing..." in the UI

---

## Error Handling Patterns

### Service Layer Error Handling

```javascript
async getChatSession(sessionId, userId, page = 1, perPage = 50) {
  try {
    // ... operation
  } catch (error) {
    console.error('Error in getChatSession:', {
      error: error.message,
      sessionId,
      userId,
      status: error.status
    });

    // Rethrow with context
    if (error.status === 403) {
      throw new Error('You do not have permission to access this chat');
    } else if (error.status === 404) {
      throw new Error('Chat session not found');
    } else if (!navigator.onLine) {
      throw new Error('Network error: You are currently offline');
    } else {
      throw new Error(`Failed to load chat: ${error.message}`);
    }
  }
}
```

### Retry Logic with Exponential Backoff

```javascript
let message;
const maxRetries = 3;
let retryCount = 0;
let lastError;

while (retryCount < maxRetries) {
  try {
    message = await this.pb.collection('messages').create(messageData);

    // Update last message timestamp
    await this.updateLastMessageTime(sessionId);

    // Update message status to sent
    message.status = 'sent';
    return message;

  } catch (error) {
    lastError = error;
    retryCount++;

    // Don't retry for client-side errors (4xx)
    if (error.status >= 400 && error.status < 500) {
      break;
    }

    // Exponential backoff: 1s, 2s, 4s
    await new Promise(resolve =>
      setTimeout(resolve, 1000 * Math.pow(2, retryCount))
    );
  }
}

// All retries failed
throw lastError || new Error('Failed to send message after multiple attempts');
```

---

## Key Features Summary

### ✅ Implemented in Webapp

1. **Three Chat Types:**
   - GOL Support Chat (customer ↔ GOL staff)
   - Client-Customer Chat (customer ↔ client)
   - Ticket Chat (linked to support tickets)

2. **Real-Time Updates:**
   - Live message delivery
   - Session status updates
   - New chat notifications

3. **Message Features:**
   - Text messages
   - File attachments (images, PDF, Word)
   - Read receipts
   - Timestamps

4. **Session Management:**
   - Create/close sessions
   - Duplicate prevention
   - Status tracking (Open, Close, Active, Pending, Rejected)
   - Service type categorization

5. **UI/UX:**
   - Message bubbles with grouping
   - Typing indicators (local)
   - Auto-scroll
   - Pagination (load more)
   - Attachment previews
   - Service type badges with icons
   - Unread indicators

6. **Data Management:**
   - Optimistic updates
   - Duplicate message prevention
   - Error handling with user-friendly messages
   - Retry logic
   - Offline detection

---

## Expo Mobile App Implementation Guide

### 1. Set Up PocketBase Client

```typescript
// lib/pocketbase/pb.ts
import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.EXPO_PUBLIC_PB_URL!);

// Disable auto-cancellation to support multiple requests
pb.autoCancellation(false);

export default pb;
```

### 2. Service Layer (TypeScript)

Based on the existing `lib/actions/support/chat.ts`, extend with:

```typescript
// lib/actions/chats/customerClientChat.ts
import pb from '@/lib/pocketbase/pb';

export class CustomerClientChatService {
  private pb = pb;
  private activeSubscriptions: Set<string> = new Set();

  async createChatSession(
    customerId: string,
    clientId: string,
    subject: string,
    serviceType?: string
  ) {
    // Check for existing session
    const existing = await this.pb.collection('chat_session').getList(1, 1, {
      filter: `chatType = "client_customer" && ((customer = "${customerId}" && client = "${clientId}") || (customer = "${clientId}" && client = "${customerId}"))`
    });

    if (existing.items.length > 0) {
      return existing.items[0];
    }

    return await this.pb.collection('chat_session').create({
      chatType: 'client_customer',
      customer: customerId,
      client: clientId,
      subject: subject || 'General Inquiry',
      serviceType,
      status: 'Open',
      lastMessageAt: new Date().toISOString()
    });
  }

  async getChatSessions(userId: string, userType: 'customer' | 'client') {
    const filter = userType === 'customer'
      ? `chatType = "client_customer" && customer = "${userId}"`
      : `chatType = "client_customer" && client = "${userId}"`;

    const result = await this.pb.collection('chat_session').getList(1, 50, {
      filter,
      sort: '-lastMessageAt',
      expand: 'customer,client'
    });

    return result.items;
  }

  // ... implement other methods from webapp
}

export default new CustomerClientChatService();
```

### 3. React Hook (Expo/React Native)

```typescript
// hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '@/lib/actions/chats/chatService';
import { useAuth } from '@/context/AuthContext';

export function useChat(sessionId?: string) {
  const { user } = useAuth();
  const [chatSession, setChatSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const subscriptionRef = useRef<string | null>(null);

  const sendMessage = useCallback(async (content: string, attachment?: File) => {
    if (!chatSession || !user) return;

    // Optimistic update
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      chat: chatSession.id,
      sender: user.id,
      content,
      created: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const result = await chatService.sendMessage(
        chatSession.id,
        user.id,
        content,
        attachment
      );

      // Replace optimistic message
      setMessages(prev =>
        prev.map(msg => msg.id === optimisticMessage.id ? result : msg)
      );
    } catch (error) {
      // Remove on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      throw error;
    }
  }, [chatSession, user]);

  const subscribeToUpdates = useCallback((sessionId: string) => {
    const unsubMessages = pb.collection('messages').subscribe('*', (e: any) => {
      if (e.record.chat === sessionId && e.record.sender !== user?.id) {
        if (e.action === 'create') {
          setMessages(prev => [...prev, e.record]);
        } else if (e.action === 'update') {
          setMessages(prev =>
            prev.map(msg => msg.id === e.record.id ? e.record : msg)
          );
        }
      }
    });

    const unsubSession = pb.collection('chat_session').subscribe(sessionId, (e: any) => {
      if (e.action === 'update') {
        setChatSession(e.record);
        if (e.record.status === 'Close') {
          setIsConnected(false);
        }
      }
    });

    subscriptionRef.current = sessionId;

    return () => {
      unsubMessages();
      unsubSession();
    };
  }, [user]);

  // Load session on mount
  useEffect(() => {
    if (sessionId && user) {
      loadChatSession(sessionId);

      // Subscribe
      const cleanup = subscribeToUpdates(sessionId);
      return cleanup;
    }
  }, [sessionId, user]);

  return {
    chatSession,
    messages,
    loading,
    sendMessage,
    loadChatSession,
    closeChatSession,
    isConnected
  };
}
```

### 4. UI Components (React Native)

**ChatWindow.native.tsx:**
```typescript
import React from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useChat } from '@/hooks/useChat';
import { send } from 'lucide-react-native';

export function ChatWindow({ route }: { route: any }) {
  const { sessionId } = route.params;
  const { chatSession, messages, sendMessage } = useChat(sessionId);
  const [messageText, setMessageText] = React.useState('');
  const flatListRef = React.useRef<FlatList>(null);

  const handleSend = async () => {
    if (messageText.trim()) {
      await sendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const renderMessage = ({ item, index }: any) => {
    const isMyMessage = item.sender === currentUser?.id;
    const showAvatar = index === 0 || messages[index - 1]?.sender !== item.sender;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.theirMessage
      ]}>
        {/* Avatar */}
        {!isMyMessage && showAvatar && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        )}

        {/* Message bubble */}
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myBubble : styles.theirBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myText : styles.theirText
          ]}>
            {item.content}
          </Text>

          <Text style={styles.timeText}>
            {new Date(item.created).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.userName}>
          {chatSession?.expand?.client?.firstname} {chatSession?.expand?.client?.lastname}
        </Text>
        <Text style={styles.status}>{chatSession?.status}</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            style={styles.sendButton}
            disabled={!messageText.trim()}
          >
            <send size={24} color={messageText.trim() ? '#2563EB' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  status: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 4
  },
  myMessage: {
    justifyContent: 'flex-end'
  },
  theirMessage: {
    justifyContent: 'flex-start'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  avatarText: {
    fontSize: 16
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12
  },
  myBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4
  },
  myText: {
    color: '#FFFFFF'
  },
  theirText: {
    color: '#111827'
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
    textAlign: 'right'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    backgroundColor: '#F9FAFB'
  },
  sendButton: {
    padding: 8
  }
});
```

### 5. Navigation Setup

```typescript
// app/(protected)/chat/index.tsx - Session List
import React from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { customerClientChatService } from '@/lib/actions/chats/customerClientChat';
import { useAuth } from '@/context/AuthContext';

export default function ChatSessionsList() {
  const { user } = useAuth();
  const [sessions, setSessions] = React.useState([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const userType = user.role === 'Customer' ? 'customer' : 'client';
    const result = await customerClientChatService.getChatSessions(user.id, userType);
    setSessions(result);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => router.push(`/chat/${item.id}`)}
      style={styles.sessionItem}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.serviceType === 'CFS' ? '📦' :
           item.serviceType === 'Transport' ? '🚚' :
           item.serviceType === '3PL' ? '🏢' : '👤'}
        </Text>
      </View>
      <View style={styles.sessionInfo}>
        <Text style={styles.userName}>
          {item.expand?.client?.firstname} {item.expand?.client?.lastname}
        </Text>
        <Text style={styles.subject}>{item.subject}</Text>
        <Text style={styles.lastMessageTime}>
          {new Date(item.lastMessageAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

// ... styles
```

```typescript
// app/(protected)/chat/[id].tsx - Chat Window
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default function ChatPage() {
  const { id } = useLocalSearchParams();

  return (
    <ChatWindow route={{ params: { sessionId: id } }} />
  );
}
```

---

## Implementation Checklist for Expo App

- [ ] **PocketBase Setup**
  - [ ] Initialize PocketBase client
  - [ ] Configure API endpoint
  - [ ] Set up authentication

- [ ] **Service Layer**
  - [ ] Create `chatService` (GOL support)
  - [ ] Create `customerClientChatService` (client-customer)
  - [ ] Create `ticketChatService` (ticket support)
  - [ ] Implement retry logic
  - [ ] Add file upload handling

- [ ] **React Hooks**
  - [ ] Create `useChat` hook
  - [ ] Implement optimistic updates
  - [ ] Add real-time subscriptions
  - [ ] Handle loading/error states

- [ ] **UI Components**
  - [ ] ChatSessionList (FlatList based)
  - [ ] ChatWindow (FlatList for messages)
  - [ ] NewChatModal (multi-step)
  - [ ] MessageBubble component

- [ ] **Features**
  - [ ] Send/receive messages
  - [ ] File attachments
  - [ ] Read receipts
  - [ ] Typing indicators
  - [ ] Message pagination
  - [ ] Auto-scroll to bottom

- [ ] **Navigation**
  - [ ] Setup routes: `/chat` and `/chat/[id]`
  - [ ] Handle back navigation
  - [ ] Preserve scroll position

- [ ] **TypeScript Types**
  - [ ] Define `ChatSessionRecord`
  - [ ] Define `MessageRecord`
  - [ ] Define service types

- [ ] **Styling**
  - [ ] Message bubble styles
  - [ ] Service type badges
  - [ ] Avatar components
  - [ ] Responsive layout

---

## Notes & Considerations

1. **PocketBase Real-time:** Expo's standard SocketPolyfill works with PocketBase. No special configuration needed.

2. **File Uploads in Expo:** Use `expo-document-picker` for file selection and `expo-file-system` for handling file URIs.

3. **Background Messaging:** For real-time updates when app is in background, consider:
   - Expo push notifications
   - Periodic polling fallback
   - WebSocket reconnection logic

4. **Offline Support:**
   - Cache messages locally (expo-sqlite or AsyncStorage)
   - Queue failed messages for retry when back online
   - Show offline indicator

5. **Performance:**
   - Virtualize long message lists with `FlatList`
   - Implement pagination for large chat histories
   - Debounce typing indicators

6. **Security:**
   - All API calls are protected by PocketBase rules
   - Never store sensitive data locally unencrypted
   - Use secure storage for auth tokens

---

## File Structure Reference

```
linkmylogistics/
├── src/
│   ├── services/
│   │   ├── chatService.js                    # GOL support chat
│   │   ├── customerClientChatService.js      # Client-customer chat
│   │   └── ticketChatService.js               # Ticket chat
│   ├── hooks/
│   │   └── useChat.js                        # React chat hook
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWindow.jsx               # Main chat UI
│   │   │   ├── ChatSessionList.jsx           # Session list
│   │   │   ├── NewChatModal.jsx              # New chat modal
│   │   │   ├── CloseChatButton.jsx
│   │   │   └── StartClientChatButton.jsx
│   │   ├── support/
│   │   │   ├── SupportChat.jsx
│   │   │   └── ...
│   │   └── utils/
│   │       └── Chatbot.jsx
│   └── app/(software)/
│       ├── customer/(after_login)/chat/
│       │   ├── page.jsx
│       │   └── components/
│       └── client/(after_login)/customer-chat/
│           ├── page.jsx
│           └── components/

logistics-app-new (Expo) Target Structure:
├── lib/
│   ├── actions/
│   │   ├── chats/
│   │   │   ├── chatService.ts              # GOL support
│   │   │   ├── customerClientChatService.ts # Client-customer
│   │   │   └── ticketChatService.ts        # Ticket chat
│   │   └── support/
│   │       ├── chat.ts                      # Existing, extend this
│   │       └── types.ts
│   └── pocketbase/
│       └── pb.ts
├── hooks/
│   └── useChat.ts                           # Chat hook
├── components/
│   └── chat/
│       ├── ChatWindow.tsx                   # Native UI
│       ├── ChatSessionList.tsx
│       ├── NewChatModal.tsx
│       └── MessageBubble.tsx
├── context/
│   └── ChatContext.ts                       # Optional: context provider
└── app/(protected)/
    └── chat/
        ├── index.tsx                        # Session list
        └── [id].tsx                         # Chat window
```

---

## Summary

This documentation covers the entire chat system from the linkmylogistics webapp, including:

✅ **Database schema** (chat_session, messages collections)
✅ **Service layer** (3 services: GOL support, client-customer, ticket)
✅ **React hook** (useChat for state management)
✅ **UI components** (ChatWindow, ChatSessionList, NewChatModal)
✅ **Real-time subscriptions** (PocketBase event handling)
✅ **Key features** (pagination, file uploads, read receipts, typing indicators)
✅ **Error handling & retry logic**
✅ **Expo implementation guide** with TypeScript code examples

Use this as a reference for Cursor to implement the same chat system in the logistics-app-new Expo mobile app!