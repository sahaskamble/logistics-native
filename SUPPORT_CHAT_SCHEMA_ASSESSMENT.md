# Support & Chat System – Schema v1.2.4 Assessment

## Summary: **Yes, you can build proper support & chat**

The schema in `logistics-schema-v1.2.4.json` already defines three collections that support a full support-ticket + chat flow:

| Collection      | Purpose |
|----------------|--------|
| **ticket**     | Support tickets (subject, description, status, priority, customer, assigned_to, relatedOrderid) |
| **chat_session** | Chat threads (support or client_customer; linked to ticket; customer/agent/client; typing; lastMessageAt) |
| **messages**   | Individual messages (chat, sender, content, attachments, isRead, readAt, messageType) |

---

## Schema details

### 1. `ticket`

- **Fields:** id, customer, assigned_to, subject, description, status, priority, accepted, relatedOrderid, created, updated  
- **Status:** Open, In_Progress, Resolved, Closed  
- **Priority:** Low, Medium, High, Urgent  

**Important:** In the exported schema, `listRule`, `viewRule`, `createRule`, `updateRule`, `deleteRule` are all empty. For the mobile app you typically need:

- **Customers:** list/view/create tickets where `customer = @request.auth.id`
- **Staff (GOLMod/GOLStaff):** list all, view, update (assign, change status)

If the live backend already has these rules, the app will work as-is. If not, add rules on the `ticket` collection so customers can at least list, view, and create their own tickets.

---

### 2. `chat_session`

- **Fields:** id, user, agent, client, customer, status, closed_at, chatType, subject, serviceType, lastMessageAt, relatedOrderid, ticket, typingUserId, created, updated  
- **chatType:** `support` | `client_customer`  
- **serviceType:** CFS, Transport, 3PL, Warehouse  
- **status:** Open, Close  

**Rules (from schema):**

- **List/View:** `customer = @request.auth.id || agent = @request.auth.id || client = @request.auth.id`
- **Update:** same participants and `status != "Close"`
- **Delete:** Root or GOLMod only  
- **Create:** empty in schema – if the app should start support chats from the client, add a create rule (e.g. `customer = @request.auth.id` for support chats).

---

### 3. `messages`

- **Fields:** id, chat, sender, content, attachments, isRead, readAt, messageType, created, updated  
- **messageType:** text, file  

**Rules (from schema):**

- **List/View:** same as chat_session (participant in chat)
- **Create:** `sender = @request.auth.id` and user is participant in chat
- **Update:** participant but not sender (e.g. for marking read)
- **Delete:** sender or Root or GOLMod  

This is enough for listing messages, sending text/file messages, and marking them read.

---

## What’s implemented in the app

Under `lib/actions/support/`:

- **Types** (`types.ts`): `TicketRecord`, `ChatSessionRecord`, `MessageRecord` and enums aligned with the schema.
- **Tickets** (`ticket.ts`): `listTicketsForCurrentUser`, `getTicket`, `createTicket` (using `pb.collection("ticket")`).
- **Chat** (`chat.ts`):
  - `listChatSessionsForCurrentUser`, `getChatSession`, `createChatSession`
  - `listMessages`, `sendMessage`, `markChatMessagesAsRead`
  - `subscribeToChatMessages(chatId, onRecord)` for realtime new messages (client-side filter by `chatId`).

Patterns match the rest of the app (PocketBase client, `getCurrentUser()`, same error handling style).

---

## Backend rules to double-check

1. **ticket**  
   - If customers should see and create tickets from the app: ensure list/view/create rules allow `customer = @request.auth.id` (and staff rules if you have an agent UI).

2. **chat_session**  
   - If the app creates support chats: add a create rule (e.g. `customer = @request.auth.id`) or keep create admin-only and have the backend create the session when a ticket is opened.

3. **messages**  
   - No change needed if you’re using the schema rules as exported; create/update/delete already align with a normal chat UX.

---

## Suggested mobile flows

- **Support:**  
  - Customer creates a **ticket** (subject, description, optional order).  
  - App or backend creates a **chat_session** with `chatType = "support"` and `ticket = <ticketId>`.  
  - Customer and agents use **messages** in that session; use `subscribeToChatMessages` for live updates.

- **Client–customer chat:**  
  - Same as above but `chatType = "client_customer"` and use `client` / `customer` as appropriate.

You can add UI under e.g. `app/(protected)/support/` (ticket list, ticket detail, chat thread, message list + composer) and wire them to the new actions and types.

---

## Conclusion

The schema supports a proper support and chat system. The main dependency is ensuring PocketBase rules for `ticket` (and optionally `chat_session` create) match how you want customers and staff to use the app. The new `lib/actions/support` layer gives you a solid base to build the Expo screens on.
