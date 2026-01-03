import { useState, useEffect } from "react";
import { ScrollView, View, RefreshControl, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import LoadingView from "@/components/LoadingView";
import { Bell, BellOff } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

type Notification = {
  id: string;
  title?: string;
  description?: string;
  type?: string;
  status?: string;
  isRead?: boolean;
  created?: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const user = getCurrentUser();
      if (!user.isValid || !user.user?.id) {
        setLoading(false);
        return;
      }

      // Filter by user if field exists, otherwise use createdFor
      let filter = `createdFor="Customer" && status="Active"`;

      // Try to use user field if it exists
      try {
        const test = await pb.collection("notification").getList(1, 10000000, {
          filter: `user="${user.user.id}"`,
        });
        filter = `user="${user.user.id}" && status="Active"`;
      } catch {
        // Use createdFor as fallback
        filter = `createdFor="Customer" && status="Active"`;
      }

      const response = await pb.collection("notification").getFullList<Notification>({
        filter: filter,
        sort: "-created",
      });

      setNotifications(response);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await pb.collection("notification").update(notificationId, {
        isRead: true,
      });

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
          <Text className="text-2xl font-semibold">Notifications</Text>
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

