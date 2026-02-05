import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { mergeFilters, type PbQueryOptions } from "@/lib/actions/pbOptions";

export type NotificationRecord = {
  id: string;
  title?: string;
  description?: string;
  type?: "event" | "alert" | string;
  status?: "Active" | "Inactive" | string;
  createdFor?: "Customer" | "Merchant" | "Gol" | string;
  orders_id?: string;
  isRead?: boolean;
  created?: string;
  updated?: string;
  expand?: any;
};

function isPbFieldMissingError(err: any) {
  const msg = (err?.data?.message || err?.message || "").toString().toLowerCase();
  return msg.includes("missing") || msg.includes("unknown field") || msg.includes("invalid filter") || msg.includes("cannot") || msg.includes("failed to") || msg.includes("field");
}

function buildFilter(params: { userId: string; includeRead?: boolean }) {
  const parts: string[] = [];

  // Always constrain to customer-facing notifications.
  parts.push(`createdFor="Customer"`);
  parts.push(`status="Active"`);

  if (!params.includeRead) {
    parts.push(`isRead=false`);
  }

  // Prefer explicit user filtering when the field exists.
  parts.push(`user="${params.userId}"`);

  return parts.join(" && ");
}

async function runListWithBestFilter(params: {
  userId: string;
  options?: PbQueryOptions;
  includeRead?: boolean;
}): Promise<NotificationRecord[]> {
  const baseOptions: PbQueryOptions = {
    ...params.options,
    sort: params.options?.sort || "-created",
    expand: params.options?.expand || "user,createdBy",
  };

  // Attempt 1: filter by user + createdFor.
  try {
    const filter = mergeFilters(buildFilter({ userId: params.userId, includeRead: params.includeRead }), params.options?.filter);
    return await pb.collection("notification").getFullList<NotificationRecord>({
      ...baseOptions,
      filter,
    });
  } catch (err: any) {
    // If the `user` relation doesn't exist yet, fall back to createdFor-only.
    if (!isPbFieldMissingError(err)) throw err;
  }

  // Attempt 2: createdFor-only filter.
  const fallbackFilter = mergeFilters(
    `createdFor="Customer" && status="Active"${params.includeRead ? "" : " && isRead=false"}`,
    params.options?.filter
  );

  return pb.collection("notification").getFullList<NotificationRecord>({
    ...baseOptions,
    filter: fallbackFilter,
  });
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

    const records = await runListWithBestFilter({ userId: user.user.id, options, includeRead: true });
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

    const list = await runListWithBestFilter({ userId: user.user.id, includeRead: false, options: { sort: "-created" } });
    return { success: true, message: "Fetched unread count.", output: list.length };
  } catch (err: any) {
    console.error("Error getting unread count", err);
    const status = err?.status;
    const details = err?.data?.message || err?.message;
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

export async function createNotificationForCurrentUser(params: {
  title: string;
  description?: string;
  type?: "event" | "alert";
  ordersId?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated." };
    }

    const title = params.title?.trim();
    if (!title) {
      return { success: false, message: "Notification title is required." };
    }

    const payload: any = {
      title,
      description: (params.description || "").trim() || undefined,
      type: params.type || "alert",
      status: "Active",
      createdFor: "Customer",
      isRead: false,
      orders_id: params.ordersId?.trim() || undefined,
      user: user.user.id,
    };

    // If user relation isn't present, remove it.
    try {
      await pb.collection("notification").create(payload);
    } catch (err: any) {
      if (!isPbFieldMissingError(err)) throw err;
      const fallbackPayload = { ...payload };
      delete fallbackPayload.user;
      await pb.collection("notification").create(fallbackPayload);
    }

    return { success: true, message: "Notification created." };
  } catch (err: any) {
    console.error("Error creating notification", err);
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status ? `Failed to create notification (HTTP ${status}). ${details || ""}`.trim() : details || "Failed to create notification.";
    return { success: false, message };
  }
}
