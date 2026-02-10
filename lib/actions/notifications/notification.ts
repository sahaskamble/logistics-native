import AsyncStorage from "@react-native-async-storage/async-storage";
import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { mergeFilters, type PbQueryOptions } from "@/lib/actions/pbOptions";

/**
 * Notification system per NOTIFICATION_SYSTEM_FOR_MOBILE.md
 * - Filter: status = "Active" && createdFor matches user role (no isRead, no user in filter)
 * - Read state: LOCAL only (AsyncStorage), not server
 * - link1/link2/link3 for click-to-view
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
  link1?: string;
  link2?: string;
  link3?: string;
  expand?: any;
};

/**
 * Map users.role (Root, GOLMod, GOLStaff, Merchant, Customer) to notification createdFor (Customer, Merchant, Gol)
 */
function getMappedRole(user: { role?: string } | null): "Customer" | "Merchant" | "Gol" {
  const r = (user?.role || "").toString().toLowerCase();
  if (r === "merchant" || r === "client") return "Merchant";
  if (r === "golmod" || r === "golstaff" || r === "gol_mod" || r === "gol") return "Gol";
  return "Customer";
}

const READ_STORAGE_PREFIX = "readNotifications_";

function getReadStorageKey(userId: string, role: string): string {
  return `${READ_STORAGE_PREFIX}${userId}_${role.toLowerCase()}`;
}

export async function getReadNotificationIds(): Promise<Set<string>> {
  const user = getCurrentUser();
  if (!user.isValid || !user.user?.id) return new Set();
  const role = getMappedRole(user.user);
  const key = getReadStorageKey(user.user.id, role);
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export async function markNotificationAsReadLocal(notificationId: string): Promise<void> {
  const user = getCurrentUser();
  if (!user.isValid || !user.user?.id) return;
  const role = getMappedRole(user.user);
  const key = getReadStorageKey(user.user.id, role);
  const set = await getReadNotificationIds();
  set.add(notificationId);
  await AsyncStorage.setItem(key, JSON.stringify([...set]));
}

export async function markAllNotificationsAsReadLocal(ids: string[]): Promise<void> {
  const user = getCurrentUser();
  if (!user.isValid || !user.user?.id || ids.length === 0) return;
  const role = getMappedRole(user.user);
  const key = getReadStorageKey(user.user.id, role);
  const set = await getReadNotificationIds();
  ids.forEach((id) => set.add(id));
  await AsyncStorage.setItem(key, JSON.stringify([...set]));
}

/**
 * Schema v1.2.4: createdFor is multi-select (maxSelect: 3).
 * Use ?~ (contains) for multi-select: createdFor ?~ "Customer"
 */
function buildFilter(role: "Customer" | "Merchant" | "Gol"): string {
  return `status = "Active" && createdFor ?~ "${role}"`;
}

const DEFAULT_PAGE_SIZE = 50;

async function listForRole(params: {
  options?: PbQueryOptions & { fullList?: boolean };
}): Promise<NotificationRecord[]> {
  const user = getCurrentUser();
  if (!user.isValid || !user.user?.id) return [];

  const role = getMappedRole(user.user);
  const filter = buildFilter(role);
  const { fullList, ...restOptions } = params.options ?? {};
  const baseOptions = {
    sort: restOptions.sort ?? "-created",
    filter: restOptions.filter ? mergeFilters(filter, restOptions.filter) : filter,
    expand: restOptions.expand,
  };

  if (fullList) {
    const records = await pb.collection("notification").getFullList<NotificationRecord>({
      ...restOptions,
      ...baseOptions,
    });
    return records;
  }

  const perPage = restOptions.perPage ?? DEFAULT_PAGE_SIZE;
  const result = await pb.collection("notification").getList<NotificationRecord>(1, perPage, {
    ...restOptions,
    ...baseOptions,
  });
  return result.items ?? [];
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
    const records = await listForRole({ options });
    return { success: true, message: "Fetched notifications.", output: records };
  } catch (err: any) {
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status
      ? `Failed to fetch notifications (HTTP ${status}). ${details || ""}`.trim()
      : details || "Failed to fetch notifications.";
    return { success: false, message, output: [] };
  }
}

/** Unread count = notifications NOT in local read Set (per doc, read is local only) */
export async function getUnreadNotificationsCountForCurrentUser(): Promise<{
  success: boolean;
  message: string;
  output: number;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: true, message: "Not authenticated.", output: 0 };
    }
    const [records, readSet] = await Promise.all([
      listForRole({ options: { sort: "-created", fullList: true } }),
      getReadNotificationIds(),
    ]);
    const unread = records.filter((r) => !readSet.has(r.id)).length;
    return { success: true, message: "Fetched unread count.", output: unread };
  } catch {
    return { success: false, message: "Failed to fetch unread count.", output: 0 };
  }
}

/** Legacy: mark on server if schema supports it. Prefer markNotificationAsReadLocal for doc compliance. */
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
    if (!id) return { success: false, message: "Notification ID is required." };
    await pb.collection("notification").update(id, { isRead: true });
    await markNotificationAsReadLocal(id);
    return { success: true, message: "Marked as read." };
  } catch {
    await markNotificationAsReadLocal(notificationId);
    return { success: true, message: "Marked as read (local)." };
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

export async function createNotification(params: CreateNotificationParams): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const current = getCurrentUser();
    const createdFor = params.createdFor ?? "Customer";
    const targetUserId =
      params.userId?.trim() ||
      (createdFor === "Customer" && current.isValid && current.user?.id ? current.user.id : "");

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
    if (targetUserId) payload.user = targetUserId;

    await pb.collection("notification").create(payload as any);
    return { success: true, message: "Notification created." };
  } catch (err: any) {
    const details = err?.data?.message || err?.message;
    return { success: false, message: details || "Failed to create notification." };
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
