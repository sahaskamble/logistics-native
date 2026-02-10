import { useRouter } from "expo-router";
import { ScrollView, View, TouchableOpacity, RefreshControl } from "react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoadingView from "@/components/LoadingView";
import { Bell, BellOff, AlertCircle, Calendar } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { useNotifications } from "@/lib/notifications/useNotifications";
import { parseLinkToRoute } from "@/lib/notifications/parseLink";
import type { NotificationRecord } from "@/lib/actions/notifications/notification";

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function NotificationCard({
  notification,
  isRead,
  onPress,
}: {
  notification: NotificationRecord;
  isRead: boolean;
  onPress: () => void;
}) {
  const typeIcon = notification.type === "alert" ? AlertCircle : Calendar;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card
        className={isRead ? "border-l-4 border-l-muted bg-muted/30" : "border-l-4 border-l-primary bg-primary/5"}
      >
        <CardHeader>
          <View className="flex-row items-start justify-between">
            <CardTitle className={`flex-1 text-base ${isRead ? "opacity-70" : ""}`}>
              {notification.title || "Notification"}
            </CardTitle>
            {!isRead && (
              <Badge variant="default" className="ml-2">
                <Text className="text-xs text-white">New</Text>
              </Badge>
            )}
          </View>
        </CardHeader>
        <CardContent>
          {notification.description && (
            <Text className={`text-sm text-muted-foreground mb-2 ${isRead ? "opacity-70" : ""}`}>
              {notification.description}
            </Text>
          )}
          <View className="flex-row items-center justify-between mt-2 flex-wrap gap-2">
            <Text className={`text-xs text-muted-foreground ${isRead ? "opacity-70" : ""}`}>
              {formatDate(notification.created)}
            </Text>
            <View className="flex-row items-center gap-2">
              {notification.type && (
                <Badge variant="outline" className={`px-2 py-0.5 ${isRead ? "opacity-70" : ""}`}>
                  <Text className="text-xs">{notification.type}</Text>
                </Badge>
              )}
              {notification.link1 && (
                <Badge variant="secondary" className="px-2 py-0.5">
                  <Text className="text-xs">View</Text>
                </Badge>
              )}
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    readIds,
    unreadCount,
    loading,
    refreshing,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNotificationPress = async (notification: NotificationRecord) => {
    if (!readIds.has(notification.id)) {
      await markAsRead(notification.id);
    }
    const route = parseLinkToRoute(notification.link1);
    if (route) {
      router.push(route as any);
    }
  };

  const unreadNotifications = notifications.filter((n) => !readIds.has(n.id));
  const readNotifications = notifications.filter((n) => readIds.has(n.id));

  if (loading) {
    return <LoadingView LoadingText="Loading notifications..." />;
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      <View className="p-4 gap-4">
        <View className="flex-row items-center justify-between mb-2">
          {unreadCount > 0 && (
            <>
              <Badge variant="destructive" className="px-3 py-1">
                <Text className="text-white font-semibold">{unreadCount} Unread</Text>
              </Badge>
              <Button variant="outline" size="sm" onPress={markAllAsRead}>
                <Text>Mark all as read</Text>
              </Button>
            </>
          )}
        </View>

        {unreadNotifications.length > 0 && (
          <View className="gap-3 mb-4">
            <Text className="text-lg font-semibold text-foreground">Unread</Text>
            {unreadNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isRead={false}
                onPress={() => handleNotificationPress(notification)}
              />
            ))}
          </View>
        )}

        {readNotifications.length > 0 && (
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Read</Text>
            {readNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isRead={true}
                onPress={() => handleNotificationPress(notification)}
              />
            ))}
          </View>
        )}

        {notifications.length === 0 && (
          <View className="flex-1 items-center justify-center py-12">
            <Icon as={BellOff} size={48} className="text-muted-foreground mb-4" />
            <Text className="text-lg font-semibold text-muted-foreground mb-2">No Notifications</Text>
            <Text className="text-sm text-muted-foreground text-center">
              You don&apos;t have any notifications yet.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
