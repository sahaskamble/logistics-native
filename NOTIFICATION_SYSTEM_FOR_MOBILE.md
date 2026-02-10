# Notification System: Logic, Realtime & UI — Implementation Guide for Expo React Native

This document describes the web app’s notification system in detail so you can replicate the same **logic**, **realtime behavior**, and **UI** in an Expo React Native mobile app.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Backend: PocketBase Schema](#2-backend-pocketbase-schema)
3. [When Notifications Are Created](#3-when-notifications-are-created)
4. [Creation API & Payload](#4-creation-api--payload)
5. [Fetch & Filter Logic](#5-fetch--filter-logic)
6. [Realtime (Live Updates)](#6-realtime-live-updates)
7. [Read State & Persistence](#7-read-state--persistence)
8. [UI Components & Behavior](#8-ui-components--behavior)
9. [Expo / React Native Implementation Notes](#9-expo--react-native-implementation-notes)

---

## 1. Overview

- **Backend:** PocketBase collection `notification`.
- **Realtime:** PocketBase realtime subscription on `notification`; client filters by current user role.
- **Visibility:** Each notification has `createdFor` (one or more of `Customer`, `Merchant`, `Gol`) and optional `user` (recipient user id). Only records with `status = "Active"` and whose `createdFor` includes the current user’s role are shown.
- **Links:** `link1` (and optionally `link2`, `link3`) are **full URLs** (e.g. `https://yoursite.com/customer/cfs/orders/view/xxx`) for deep linking / in-app navigation.

---

## 2. Backend: PocketBase Schema

**Collection name:** `notification`

| Field         | Type     | Notes |
|---------------|----------|--------|
| `id`          | text     | Auto, primary key |
| `title`       | text     | Required for display |
| `description` | text     | Body text |
| `type`        | select   | `"event"` \| `"alert"` — used for icon/badge (event = info, alert = warning) |
| `status`      | select   | `"Active"` \| `"Inactive"` — only Active are listed |
| `createdFor`  | select   | **Multi-select (max 3).** Values: `"Customer"`, `"Merchant"`, `"Gol"`. Stored as array, e.g. `["Customer","Merchant"]` |
| `user`        | relation| Optional; single user (recipient). Relation to `users` collection |
| `date`        | date     | Optional |
| `sentOn`      | date     | When sent |
| `link1`       | url      | **Must be full URL** (e.g. `https://...`) — used for “View order/request” |
| `link2`       | url      | Optional |
| `link3`       | url      | Optional |
| `attachment`  | file     | Optional, multi-file |
| `created`     | autodate| |
| `updated`     | autodate| |

**List rule (example):**  
`@request.auth.id != "" && status = "Active"`  
So any authenticated user can list; filtering by role is done in the **filter query** and optionally client-side.

**Indexes (recommended):**  
`status`, `createdFor`, `created`, and composite `(status, createdFor, created)`.

---

## 3. When Notifications Are Created

Notifications are created **server-side** (or from client with PocketBase auth) in these cases:

### 3.1 Order lifecycle (`src/lib/notification.js`, `src/app/action.js`)

- **New order created (customer):**  
  - `createOrderNotification(order, 'Customer')` → confirmation for customer; `createdFor: 'Customer'`, `user: customerId`, `link1`: order view URL for customer.
- **New order created (merchant):**  
  - `createOrderNotification(order, 'Merchant')` → new order alert for merchant; `createdFor: 'Merchant'`, `user: merchantId`, `link1`: order view URL for client.
- **Order status update (Accepted/Rejected):**  
  - `createOrderNotification(order, 'Customer', status)` → e.g. “Order Accepted” / “Order Rejected” for customer; `createdFor: 'Customer'`, `user: customerId`, `link1`: order view URL.

### 3.2 Service request lifecycle

- **Service request submitted (customer):**  
  - `createServiceRequestNotification(request, 'Customer', false, serviceType)` → confirmation for customer; `createdFor: 'Customer'`, `user: requestUserId`, `link1`: service request view URL.
- **Service request submitted (merchant):**  
  - `createServiceRequestNotification(request, 'Merchant', true, serviceType)` → new request for merchant; `createdFor: 'Merchant'`, `user: merchantUserId`, `link1`: request view URL.
- **Service request rejected:**  
  - `createServiceRejectionNotification(request, rejectedBy, reason)` → `createdFor: 'Customer'`, `user: customerId`, `link1`: request view URL.

### 3.3 Other

- **Pricing requests:** confirmation, acceptance, rejection — same pattern: set `createdFor`, `user` when known, and `link1` to the relevant view.
- **GOL admin:** manual notifications from notification-management; can set `createdFor` to multiple values (e.g. `["Customer","Merchant"]`) so both roles see it.

**Important:** `link1` is stored as a **full URL** (e.g. `https://yoursite.com/customer/cfs/orders/view/xyz`). The server builds it from a base URL (e.g. `NEXT_PUBLIC_BASE_URL`) + path. Mobile should use `link1` as-is for deep linking.

---

## 4. Creation API & Payload

**Endpoint:** `POST /api/collections/notification/records` (PocketBase).

**Payload shape:**

```json
{
  "title": "Order Accepted",
  "description": "Your order #abc123 has been accepted.",
  "type": "event",
  "status": "Active",
  "createdFor": ["Customer"],
  "user": "USER_ID_OPTIONAL",
  "sentOn": "2025-02-10T12:00:00.000Z",
  "link1": "https://yoursite.com/customer/cfs/orders/view/ORDER_ID"
}
```

- **createdFor:** Always send an **array** for multi-select, e.g. `["Customer"]` or `["Customer","Merchant"]`.
- **link1 / link2 / link3:** Must be valid full URLs (PocketBase url type).
- **user:** Optional; set to the recipient’s user id when targeting a specific user.

You typically won’t create notifications from the mobile app; the same server/backend creates them. Mobile only **fetches** and **subscribes** to realtime.

---

## 5. Fetch & Filter Logic

### 5.1 Role mapping (auth → createdFor)

Auth role (from PocketBase `users.role`) is mapped to the same labels used in `createdFor`:

| Auth `user.role` | Mapped role for filter |
|------------------|------------------------|
| `CUSTOMER`       | `Customer`             |
| `MERCHANT` or `CLIENT` | `Merchant`      |
| `GOL_MOD`        | `Gol`                  |
| (default)        | `Customer`             |

Use this mapping both for the **API filter** and for **client-side** “is this notification for me?” checks.

### 5.2 Initial fetch (list)

- **Endpoint:** `GET /api/collections/notification/records`
- **Query params:**
  - `filter`: `status = "Active" && createdFor ?~ "Customer"`  
    (Replace `"Customer"` with the mapped role: `Customer`, `Merchant`, or `Gol`.)
  - `sort`: `-created`
  - `perPage`: e.g. `50`

PocketBase `?~` means “any element contains” for the multi-select field, so a notification with `createdFor: ["Customer","Merchant"]` is returned for both Customer and Merchant filters.

### 5.3 Client-side filter (after fetch / after realtime event)

- Keep only notifications where **current user’s role** is in `createdFor`:
  - If `createdFor` is **array:**  
    `createdFor.some(r => r === userRole || r.toUpperCase() === userRole.toUpperCase())`
  - If **string:**  
    `createdFor === userRole` (or case-insensitive compare).
- This handles any casing differences and ensures only relevant notifications are shown.

### 5.4 Sorting (for display)

- Optional: user-targeted first (`notification.user === currentUser.id`), then by type priority (e.g. `alert` before `event`), then by `created` descending.

---

## 6. Realtime (Live Updates)

### 6.1 Subscription

- **Collection:** `notification`
- **Pattern:** Subscribe to **all** changes: `pb.collection('notification').subscribe('*', callback)`
- **Callback argument:** `e` with:
  - `e.action`: `"create"` | `"update"` | `"delete"`
  - `e.record`: the notification record (full object).

### 6.2 Filtering each realtime event

For **every** event, decide if it’s for the current user:

1. Get `userRole` (mapped from auth, e.g. `Customer`).
2. Get `createdFor` from `e.record`.
3. **Relevant** if:
   - `createdFor` is array and contains `userRole` (or equals ignoring case), or
   - `createdFor` is string and equals `userRole` (or equals ignoring case).
4. If **not relevant**, ignore the event (don’t update local list, don’t show toast).

### 6.3 Handling create / update / delete

- **create**
  - Append `e.record` to the beginning of the list (newest first).
  - Re-apply client-side filter by role.
  - Re-apply any local filters (search, type).
  - Optionally show a **toast / in-app message**: e.g. “📢 {title}” with `description`, only if `status === 'Active'`.
- **update**
  - Replace the item with same `id` by `e.record` in the list; re-apply filters and sort.
- **delete**
  - Remove the item with `e.record.id` from the list; re-apply filters.

### 6.4 Cleanup

- On logout or unmount, **unsubscribe**: call the function returned by `subscribe(...)` so the subscription is removed.

---

## 7. Read State & Persistence

- The web app does **not** store “read” on the server; it’s **local only**.
- **Storage key:** `readNotifications_${userId}_${userType}`  
  Example: `readNotifications_abc123_customer`
- **Value:** JSON array of notification ids, e.g. `["id1","id2"]`. Implement as a **Set** in memory and persist as array.
- **Mark as read:** Add notification id to the Set and persist.
- **Mark all as read:** Add all currently displayed notification ids to the Set and persist.
- **Unread count:** Count of notifications in the current (filtered) list whose id is **not** in the Set.

In React Native, use `AsyncStorage` (or equivalent) with the same key and value format so behavior matches the web.

---

## 8. UI Components & Behavior

### 8.1 Two places notifications appear

1. **Full notifications page** (e.g. `/customer/notifications`)
   - Uses **realtime hook** (initial fetch + subscribe).
   - Shows list with filters (search, type: all / event / alert), error state, retry, refresh.

2. **Header bell (NotificationSheet / drawer)**
   - Can use same **realtime hook** or a one-time fetch + optional polling/subscription.
   - Shows unread count badge; opening shows list; tapping item can navigate to `link1` or open detail.

### 8.2 List item (card) behavior

- **Display:**  
  Icon by type (event = calendar/info, alert = alert), type badge, title, description (e.g. 2 lines), sent/date, optional “View order/request” button if `link1` exists.
- **Read vs unread:**  
  Visual distinction (e.g. border color, opacity). Unread = id not in read Set.
- **On tap:**
  1. If not read, mark as read (add id to Set and persist).
  2. If `link1` exists: **navigate** to that URL (web: in-app route; mobile: **deep link** to the same screen).
  3. If no `link1`: open a **detail modal** (title, description, links, attachments, dates).

### 8.3 Detail modal / screen

- Show: title, type badge, description, event date/time if type is event, `link1`/`link2`/`link3` as buttons or links, attachments (download), sent on / created.
- **link1:** Primary CTA — “View order/request” → navigate to `link1` (deep link on mobile).
- Attachments: download URL format  
  `{PB_URL}/api/files/notification/{notificationId}/{filename}`  
  (auth may be required depending on your PocketBase rules.)

### 8.4 Empty & error states

- **Empty:** Icon + “No notifications found” + optional “Refresh” button.
- **Error (fetch failed):** Message + “Retry” button that refetches.

### 8.5 Type and icons

- **event:** Informational (e.g. order created, accepted) — blue/info icon.
- **alert:** Warning/negative (e.g. rejected) — red/alert icon.
- **default:** Generic bell icon.

---

## 9. Expo / React Native Implementation Notes

### 9.1 API and auth

- Use the **same PocketBase base URL** as the web app.
- After login, store PocketBase auth token and send it on every request (e.g. in `Authorization` or PocketBase’s expected header).
- Use the same **filter** and **sort** for the list API as in §5.2.

### 9.2 Realtime options

- **Option A – PocketBase JS SDK:**  
  Use `pb.collection('notification').subscribe('*', callback)` in a React Native context (e.g. in a hook that runs when the user is logged in). Same logic as §6 (filter by role, then apply create/update/delete).
- **Option B – No WebSocket:**  
  Poll `GET /api/collections/notification/records` with the same filter every N seconds; merge results into local state and show toast for new items (compare by `id` and `created`).

### 9.3 Deep linking (link1)

- `link1` is a full URL, e.g. `https://yoursite.com/customer/cfs/orders/view/ORDER_ID`.
- In Expo, configure **scheme** and **path** (e.g. `yourapp://order/ORDER_ID` or path-based).
- When the user taps “View order/request” or a notification with `link1`:
  - Parse the path (e.g. `/customer/cfs/orders/view/:orderId`).
  - Map to a screen in your stack, e.g. `OrderView` with `orderId`, and navigate.

You can either:
- Map server paths to app routes (e.g. `/customer/cfs/orders/view/xyz` → `OrderView` with `xyz`), or
- Store app-specific URLs in a custom field and use that in the app; the web keeps using full web URLs.

### 9.4 Read state

- Use **AsyncStorage** (or Expo SecureStore if you want it encrypted):  
  Key `readNotifications_${userId}_${userType}`, value `JSON.stringify([...readSet])`.
- On app load, read the key and initialize a Set; use that for “is read” and “unread count”.

### 9.5 UI parity

- Reuse the same **filter logic** (role, createdFor array/string), **sort**, and **realtime rules** (create/update/delete, relevance by role).
- Replicate list item layout (icon, badge, title, description, date, CTA), detail view (title, description, links, attachments), empty/error states, and mark-as-read + mark-all-as-read behavior.

If you follow this doc, your Expo app will mirror the web app’s notification **logic** (who sees what, when), **realtime** (live list + optional toast), and **UI** (list, detail, links, read state), and you can plug in PocketBase + deep linking as above.

---

## Quick Reference

### PocketBase list filter

```
status = "Active" && createdFor ?~ "Customer"
```

Use `Customer`, `Merchant`, or `Gol` per logged-in role. `?~` = "any element contains" for multi-select.

### Realtime subscription (pseudo)

```js
const unsubscribe = await pb.collection('notification').subscribe('*', (e) => {
  const notification = e.record;
  if (!isRelevantForCurrentRole(notification)) return;
  switch (e.action) {
    case 'create': /* prepend, maybe toast */ break;
    case 'update': /* replace by id */ break;
    case 'delete': /* remove by id */ break;
  }
});
// On unmount: unsubscribe();
```

### Read storage key

`readNotifications_${userId}_${userType}` (e.g. `readNotifications_abc123_customer`). Value: JSON array of notification ids.

### link1 on mobile

Stored as full URL. Parse path (e.g. `/customer/cfs/orders/view/ORDER_ID`) and navigate to the matching screen (e.g. Order Detail with `ORDER_ID`).
