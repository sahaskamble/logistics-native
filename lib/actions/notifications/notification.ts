import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { mergeFilters, type PbQueryOptions } from "@/lib/actions/pbOptions";

/**
 * Matches notification collection in logistics-schema-v1.2.3.json:
 * - listRule: @request.auth.id != "" && status = "Active"
 * - viewRule: same as listRule
 * - updateRule: @request.auth.id != ""
 * - Fields: id, title, description, attachment, type (event|alert), date, mode, time, sentOn,
 *   start_time, end_time, status (Active|Inactive), link1, link2, link3, createdFor (Customer|Merchant|Gol),
 *   orders_id, isRead (bool), created, updated, user (relation to _pb_users_auth_)
 */
export type NotificationRecord = {
  id: string;
  title?: string;
  description?: string;
  type?: "event" | "alert";
  status?: "Active" | "Inactive";
  createdFor?: "Customer" | "Merchant" | "Gol";
  orders_id?: string;
  isRead?: boolean;
  created?: string;
  updated?: string;
  user?: string;
  expand?: any;
};

function isPbFieldMissingError(err: any) {
  const msg = (err?.data?.message || err?.message || "").toString().toLowerCase();
  return msg.includes("missing") || msg.includes("unknown field") || msg.includes("invalid filter") || msg.includes("cannot") || msg.includes("failed to") || msg.includes("field");
}

/**
 * Build filter using only schema fields. listRule allows listing records where status = "Active".
 * We filter by createdFor and status (required by listRule); optionally isRead; optionally user.
 * PocketBase filter: field = "value" for select, isRead = false for bool, user = "id" for relation.
 */
function buildFilter(params: { includeRead?: boolean; userId?: string }) {
  const parts: string[] = [
    'status = "Active"',
    'createdFor = "Customer"',
  ];
  if (params.includeRead === false) {
    parts.push("isRead = false");
  }
  if (params.userId) {
    parts.push(`user = "${params.userId}"`);
  }
  return parts.join(" && ");
}

/**
 * List notifications for the current user. Uses schema fields only.
 * Tries filter with user first; on failure falls back to minimal filter and filters by user in memory.
 */
async function listForUser(params: {
  userId: string;
  options?: PbQueryOptions;
  includeRead: boolean;
}): Promise<NotificationRecord[]> {
  const baseOptions: PbQueryOptions = {
    ...params.options,
    sort: params.options?.sort ?? "-created",
    expand: params.options?.expand,
  };

  const tryFetch = (filter: string) =>
    pb.collection("notification").getFullList<NotificationRecord>({
      ...baseOptions,
      filter: params.options?.filter ? mergeFilters(filter, params.options.filter) : filter,
    });

  try {
    const withUser = buildFilter({ includeRead: params.includeRead, userId: params.userId });
    return await tryFetch(withUser);
  } catch {
    const minimal = buildFilter({ includeRead: params.includeRead });
    const list = await tryFetch(minimal);
    return list.filter((r) => (r.user ?? "") === params.userId);
  }
}

export async function listNotificationsForCurrentUser(options?: PbQueryOptions): Promise<{
  success: boolean;
  message: string;
  output: NotificationRecord[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }
    const records = await listForUser({
      userId: user.user.id,
      options,
      includeRead: true,
    });
    return { success: true, message: "Fetched notifications.", output: records };
  } catch (err: any) {
    console.error("Error listing notifications", err);
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status ? `Failed to fetch notifications (HTTP ${status}). ${details || ""}`.trim() : details || "Failed to fetch notifications.";
    return { success: false, message, output: [] };
  }
}

export async function getUnreadNotificationsCountForCurrentUser(): Promise<{
  success: boolean;
  message: string;
  output: number;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: 0 };
    }
    const list = await listForUser({
      userId: user.user.id,
      options: { sort: "-created" },
      includeRead: false,
    });
    return { success: true, message: "Fetched unread count.", output: list.length };
  } catch (err: any) {
    const details = err?.data?.message || err?.message;
    console.error("Error getting unread count", err?.status, details, err?.data);
    const status = err?.status;
    const message = status ? `Failed to fetch unread count (HTTP ${status}). ${details || ""}`.trim() : details || "Failed to fetch unread count.";
    return { success: false, message, output: 0 };
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated." };
    }
    const id = notificationId?.trim();
    if (!id) {
      return { success: false, message: "Notification ID is required." };
    }
    await pb.collection("notification").update(id, { isRead: true });
    return { success: true, message: "Marked as read." };
  } catch (err: any) {
    console.error("Error marking notification as read", err);
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status ? `Failed to mark as read (HTTP ${status}). ${details || ""}`.trim() : details || "Failed to mark as read.";
    return { success: false, message };
  }
}

export type CreateNotificationParams = {
  title: string;
  description?: string;
  type?: "event" | "alert";
  ordersId?: string;
  createdFor?: "Customer" | "Merchant" | "Gol";
  userId?: string;
};

/**
 * Create a notification. Payload uses only schema fields: title, description, type, status, createdFor, orders_id, isRead, user.
 */
export async function createNotification(params: CreateNotificationParams): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const current = getCurrentUser();
    const createdFor = params.createdFor ?? "Customer";
    const targetUserId =
      params.userId?.trim() || (createdFor === "Customer" && current.isValid && current.user?.id ? current.user.id : "");

    if (!params.title?.trim()) {
      return { success: false, message: "Notification title is required." };
    }

    const payload: Record<string, unknown> = {
      title: params.title.trim(),
      description: (params.description ?? "").trim() || undefined,
      type: params.type ?? "alert",
      status: "Active",
      createdFor,
      isRead: false,
      orders_id: params.ordersId?.trim() || undefined,
    };
    if (targetUserId) {
      payload.user = targetUserId;
    }

    try {
      await pb.collection("notification").create(payload as any);
    } catch (err: any) {
      if (!isPbFieldMissingError(err)) throw err;
      delete payload.user;
      await pb.collection("notification").create(payload as any);
    }

    return { success: true, message: "Notification created." };
  } catch (err: any) {
    console.error("Error creating notification", err);
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status
      ? `Failed to create notification (HTTP ${status}). ${details || ""}`.trim()
      : details || "Failed to create notification.";
    return { success: false, message };
  }
}

export async function createNotificationForCurrentUser(params: {
  title: string;
  description?: string;
  type?: "event" | "alert";
  ordersId?: string;
}): Promise<{ success: boolean; message: string }> {
  return createNotification({ ...params, createdFor: "Customer" });
}
