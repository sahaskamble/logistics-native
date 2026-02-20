import { useCallback, useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { MessageCircle, Container, Truck, Boxes, Warehouse, Plus } from "lucide-react-native";
import LoadingView from "@/components/LoadingView";
import { Button } from "@/components/ui/button";
import {
  listChatSessionsForCurrentUser,
  createChatSession,
  type ChatSessionRecord,
  type ServiceType,
} from "@/lib/actions/support";
import { getCurrentUser } from "@/lib/actions/users";

function formatLastMessageAt(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getServiceIcon(serviceType?: ServiceType) {
  switch (serviceType) {
    case "CFS":
      return Container;
    case "Transport":
      return Truck;
    case "3PL":
      return Boxes;
    case "Warehouse":
      return Warehouse;
    default:
      return MessageCircle;
  }
}

function getOtherPartyLabel(session: ChatSessionRecord, currentUserId: string): string {
  if (session.chatType === "support") {
    if (session.expand?.agent?.name) return session.expand.agent.name;
    if (session.ticket) return "Support (Ticket)";
    return "Support";
  }
  if (session.chatType === "client_customer") {
    const client = session.expand?.client as { id: string; name?: string; firstname?: string; lastname?: string } | undefined;
    const customer = session.expand?.customer;
    if (session.client === currentUserId && customer) {
      return customer.name ?? ([customer.firstname, customer.lastname].filter(Boolean).join(" ") || "Customer");
    }
    if (client) {
      return client.name ?? ([client.firstname, client.lastname].filter(Boolean).join(" ") || "Client");
    }
    return "Client";
  }
  return "Chat";
}

function SessionCard({
  session,
  currentUserId,
  onPress,
}: {
  session: ChatSessionRecord;
  currentUserId: string;
  onPress: () => void;
}) {
  const ServiceIcon = getServiceIcon(session.serviceType);
  const label = getOtherPartyLabel(session, currentUserId);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="mb-3">
        <CardContent className="flex-row items-center gap-3 py-4">
          <View className="rounded-full bg-muted p-2">
            <Icon as={ServiceIcon} size={22} className="text-muted-foreground" />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="font-semibold text-base" numberOfLines={1}>
              {label}
            </Text>
            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
              {session.subject || (session.ticket ? "Ticket chat" : "Chat")}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Text className="text-xs text-muted-foreground">
                {formatLastMessageAt(session.lastMessageAt)}
              </Text>
              <Badge variant={session.status === "Close" ? "outline" : "secondary"} className="px-1.5 py-0">
                <Text className="text-xs">{session.status ?? "Open"}</Text>
              </Badge>
            </View>
          </View>
          <Icon as={MessageCircle} size={18} className="text-muted-foreground" />
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}

export default function ChatListPage() {
  const router = useRouter();
  const user = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionRecord[]>([]);

  const fetchSessions = useCallback(async () => {
    const res = await listChatSessionsForCurrentUser({
      expand: "customer,agent,client,ticket",
      sort: "-lastMessageAt",
    });
    if (res.success && res.output) {
      setSessions(res.output);
    } else {
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await fetchSessions();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchSessions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  }, [fetchSessions]);

  const handleNewSupportChat = useCallback(async () => {
    if (!user.user?.id || creating) return;
    setCreating(true);
    const res = await createChatSession({
      chatType: "support",
      subject: "General inquiry",
    });
    setCreating(false);
    if (res.success && res.output) {
      router.push(`/(protected)/chat/${res.output.id}` as any);
    } else {
      Alert.alert("Error", res.message ?? "Could not start chat.");
    }
  }, [user.user?.id, creating, router]);

  if (loading) {
    return <LoadingView LoadingText="Loading chats..." />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Chats",
          headerRight: () =>
            user.user?.id ? (
              <Button
                variant="default"
                size="sm"
                onPress={handleNewSupportChat}
                disabled={creating}
              >
                <Icon as={Plus} size={18} className="mr-1" />
                <Text>New chat</Text>
              </Button>
            ) : null,
        }}
      />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="p-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {!user.user?.id ? (
          <Card>
            <CardContent className="py-8 items-center">
              <Text className="text-muted-foreground">Sign in to view chats.</Text>
            </CardContent>
          </Card>
        ) : sessions.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="py-12 items-center">
              <Icon as={MessageCircle} size={48} className="text-muted-foreground mb-4" />
              <Text className="text-lg font-semibold text-center mb-2">No chats yet</Text>
              <Text className="text-sm text-muted-foreground text-center mb-4">
                Start a support chat or open a ticket and use "Open chat" to message support.
              </Text>
              <Button onPress={handleNewSupportChat} disabled={creating}>
                <Icon as={Plus} size={18} className="mr-2" />
                <Text>New support chat</Text>
              </Button>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              currentUserId={user.user!.id}
              onPress={() => router.push(`/(protected)/chat/${session.id}` as any)}
            />
          ))
        )}
      </ScrollView>
    </>
  );
}
