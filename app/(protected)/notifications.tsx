import { useState, useEffect, useCallback } from "react";
import { ScrollView, View, RefreshControl, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Text } from "@/components/ui/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingView from "@/components/LoadingView";
import { Bell, BellOff } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { listNotificationsForCurrentUser, markNotificationAsRead, type NotificationRecord } from "@/lib/actions/notifications/notification";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await listNotificationsForCurrentUser();
      if (!res.success) {
        console.error("Error fetching notifications:", res.message);
        setNotifications([]);
      } else {
        setNotifications(res.output || []);
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refetch whenever the notifications screen is focused (e.g. opening the tab or returning to it)
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifications();
    }, [fetchNotifications])
  );

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await markNotificationAsRead(notificationId);
      if (!res.success) {
        console.error("Error marking notification as read:", res.message);
        return;
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  if (loading) {
    return <LoadingView LoadingText="Loading notifications..." />;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readNotifications = notifications.filter((n) => n.isRead);
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4 gap-4">
        {/* Header Stats */}
        <View className="flex-row items-center justify-between mb-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="px-3 py-1">
              <Text className="text-white font-semibold">{unreadCount} Unread</Text>
            </Badge>
          )}
        </View>

        {/* Unread Notifications */}
        {unreadNotifications.length > 0 && (
          <View className="gap-3 mb-4">
            <Text className="text-lg font-semibold text-foreground">Unread</Text>
            {unreadNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleMarkAsRead(notification.id)}
                activeOpacity={0.7}
              >
                <Card className="border-l-4 border-l-primary bg-primary/5">
                  <CardHeader>
                    <View className="flex-row items-start justify-between">
                      <CardTitle className="flex-1 text-base">{notification.title || "Notification"}</CardTitle>
                      <Badge variant="default" className="ml-2">
                        <Text className="text-xs text-white">New</Text>
                      </Badge>
                    </View>
                  </CardHeader>
                  <CardContent>
                    {notification.description && (
                      <Text className="text-sm text-muted-foreground mb-2">
                        {notification.description}
                      </Text>
                    )}
                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-xs text-muted-foreground">
                        {notification.created
                          ? new Date(notification.created).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : ""}
                      </Text>
                      {notification.type && (
                        <Badge variant="outline" className="px-2 py-0.5">
                          <Text className="text-xs">{notification.type}</Text>
                        </Badge>
                      )}
                    </View>
                  </CardContent>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Read Notifications */}
        {readNotifications.length > 0 && (
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Read</Text>
            {readNotifications.map((notification) => (
              <Card
                key={notification.id}
                className="border-l-4 border-l-muted bg-muted/30"
              >
                <CardHeader>
                  <CardTitle className="text-base opacity-70">
                    {notification.title || "Notification"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {notification.description && (
                    <Text className="text-sm text-muted-foreground mb-2 opacity-70">
                      {notification.description}
                    </Text>
                  )}
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-xs text-muted-foreground opacity-70">
                      {notification.created
                        ? new Date(notification.created).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : ""}
                    </Text>
                    {notification.type && (
                      <Badge variant="outline" className="px-2 py-0.5 opacity-70">
                        <Text className="text-xs">{notification.type}</Text>
                      </Badge>
                    )}
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <View className="flex-1 items-center justify-center py-12">
            <Icon as={BellOff} size={48} className="text-muted-foreground mb-4" />
            <Text className="text-lg font-semibold text-muted-foreground mb-2">
              No Notifications
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
              You don't have any notifications yet.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

