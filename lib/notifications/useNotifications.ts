import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  listNotificationsForCurrentUser,
  getReadNotificationIds,
  markNotificationAsReadLocal,
  markAllNotificationsAsReadLocal,
  type NotificationRecord,
} from "@/lib/actions/notifications/notification";
import { getCached, setCache } from "@/lib/notifications/notificationCache";
import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";

function getMappedRole(user: { role?: string } | null): "Customer" | "Merchant" | "Gol" {
  const r = (user?.role || "").toString().toLowerCase();
  if (r === "merchant" || r === "client") return "Merchant";
  if (r === "golmod" || r === "golstaff" || r === "gol_mod" || r === "gol") return "Gol";
  return "Customer";
}

function isRelevantForCurrentRole(record: NotificationRecord): boolean {
  const user = getCurrentUser();
  if (!user.isValid || !user.user?.id) return false;
  const role = getMappedRole(user.user);
  const createdFor = record.createdFor;
  if (Array.isArray(createdFor)) {
    return createdFor.some((r) => r === role || r?.toLowerCase() === role.toLowerCase());
  }
  return (createdFor || "").toString().toLowerCase() === role.toLowerCase();
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const res = await listNotificationsForCurrentUser();
    if (res.success && res.output) {
      setNotifications(res.output);
    } else {
      setNotifications([]);
    }
  }, []);

  const fetchReadIds = useCallback(async () => {
    const ids = await getReadNotificationIds();
    setReadIds(ids);
  }, []);

  const load = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    // Use cached data immediately if available (preload from layout)
    const cached = getCached();
    if (cached && !showRefreshing) {
      setNotifications(cached.notifications);
      setReadIds(cached.readIds);
      setLoading(false);
      // Refresh in background (don't block)
      void Promise.all([
        listNotificationsForCurrentUser(),
        getReadNotificationIds(),
      ]).then(([res, ids]) => {
        if (res.success && res.output) {
          setNotifications(res.output);
          setCache(res.output, ids);
        }
        setReadIds(ids);
      });
      return;
    }

    try {
      const [res, ids] = await Promise.all([
        listNotificationsForCurrentUser(),
        getReadNotificationIds(),
      ]);
      if (res.success && res.output) setNotifications(res.output);
      else setNotifications([]);
      setReadIds(ids);
      if (res.success && res.output) setCache(res.output, ids);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load when screen gains focus only (avoids duplicate load with useEffect)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Realtime subscription (SSE - may be unreliable in RN; poll is fallback)
  useEffect(() => {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) return;

    const handleRealtime = (e: { action: string; record: NotificationRecord }) => {
      if (!isRelevantForCurrentRole(e.record)) return;
      if (e.record.status !== "Active") return;

      setNotifications((prev) => {
        const list = [...prev];
        const idx = list.findIndex((n) => n.id === e.record.id);
        switch (e.action) {
          case "create":
            if (idx < 0) return [e.record, ...list];
            list[idx] = e.record;
            return list;
          case "update":
            if (idx >= 0) list[idx] = e.record;
            else list.unshift(e.record);
            return list;
          case "delete":
            return list.filter((n) => n.id !== e.record.id);
          default:
            return prev;
        }
      });
    };

    pb.collection("notification").subscribe("*", handleRealtime);
    return () => {
      pb.collection("notification").unsubscribe("*");
    };
  }, []);

  // Fallback poll every 20s - realtime SSE can be unreliable in React Native
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
      fetchReadIds();
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchReadIds]);

  const refresh = useCallback(() => {
    load(true);
  }, [load]);

  const markAsRead = useCallback(async (id: string) => {
    await markNotificationAsReadLocal(id);
    setReadIds((prev) => new Set([...prev, id]));
  }, []);

  const markAllAsRead = useCallback(async () => {
    const ids = notifications.map((n) => n.id);
    await markAllNotificationsAsReadLocal(ids);
    setReadIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return {
    notifications,
    readIds,
    unreadCount,
    loading,
    refreshing,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}
