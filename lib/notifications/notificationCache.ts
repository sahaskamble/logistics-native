import type { NotificationRecord } from "@/lib/actions/notifications/notification";
import {
  listNotificationsForCurrentUser,
  getReadNotificationIds,
} from "@/lib/actions/notifications/notification";

const CACHE_TTL_MS = 30_000; // 30 seconds

type CacheEntry = {
  notifications: NotificationRecord[];
  readIds: Set<string>;
  timestamp: number;
};

let cache: CacheEntry | null = null;

export function getCached(): CacheEntry | null {
  if (!cache) return null;
  if (Date.now() - cache.timestamp > CACHE_TTL_MS) {
    cache = null;
    return null;
  }
  return cache;
}

export function setCache(notifications: NotificationRecord[], readIds: Set<string>): void {
  cache = { notifications, readIds, timestamp: Date.now() };
}

export async function preload(): Promise<void> {
  try {
    const [res, readIds] = await Promise.all([
      listNotificationsForCurrentUser(),
      getReadNotificationIds(),
    ]);
    if (res.success && res.output) {
      setCache(res.output, readIds);
    }
  } catch {
    // Preload is best-effort; failures are ignored
  }
}
