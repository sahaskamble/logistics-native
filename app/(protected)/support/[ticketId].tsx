import { useCallback, useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  ArrowLeft,
  Calendar,
  Package,
  User,
  FileText,
  MessageCircle,
} from "lucide-react-native";
import LoadingView from "@/components/LoadingView";
import { getTicket, getOrCreateTicketChatSession, type TicketRecord, type TicketStatus } from "@/lib/actions/support";

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

function getStatusVariant(status?: TicketStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Open":
      return "default";
    case "In_Progress":
      return "secondary";
    case "Resolved":
    case "Closed":
      return "outline";
    default:
      return "outline";
  }
}

export default function TicketDetailPage() {
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ticket, setTicket] = useState<TicketRecord | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    const res = await getTicket(ticketId, {
      expand: "customer,assigned_to,relatedOrderid",
    });
    if (res.success && res.output) {
      setTicket(res.output);
    } else {
      Alert.alert("Error", res.message ?? "Failed to load ticket.");
      setTicket(null);
    }
  }, [ticketId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await fetchTicket();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchTicket]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTicket();
    setRefreshing(false);
  }, [fetchTicket]);

  if (!ticketId) {
    return (
      <>
        <Stack.Screen options={{ title: "Ticket" }} />
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-muted-foreground">Invalid ticket.</Text>
          <Button
            variant="outline"
            className="mt-4"
            onPress={() => router.back()}
          >
            <Text>Go back</Text>
          </Button>
        </View>
      </>
    );
  }

  if (loading && !ticket) {
    return <LoadingView LoadingText="Loading ticket..." />;
  }

  if (!ticket) {
    return (
      <>
        <Stack.Screen options={{ title: "Ticket" }} />
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-muted-foreground">Ticket not found.</Text>
          <Button
            variant="outline"
            className="mt-4"
            onPress={() => router.back()}
          >
            <Text>Go back</Text>
          </Button>
        </View>
      </>
    );
  }

  const relatedOrder = ticket.expand?.relatedOrderid as
    | { id?: string; blNo?: string; igmNo?: string }
    | undefined;

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.back()}
              className="rounded-full"
            >
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="p-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card className="mb-4">
          <CardHeader>
            <View className="flex-row items-start justify-between gap-2">
              <CardTitle className="flex-1 text-lg">{ticket.subject || "No subject"}</CardTitle>
              <Badge variant={getStatusVariant(ticket.status)}>
                <Text className="text-xs">{ticket.status?.replace("_", " ") ?? "—"}</Text>
              </Badge>
            </View>
            <View className="flex-row flex-wrap gap-2 mt-2">
              <Badge variant="outline">
                <Text className="text-xs">{ticket.priority ?? "—"} priority</Text>
              </Badge>
              <Text className="text-xs text-muted-foreground">
                {formatDate(ticket.created)}
              </Text>
            </View>
          </CardHeader>
          <CardContent className="gap-4">
            {ticket.description ? (
              <View>
                <View className="flex-row items-center gap-2 mb-2">
                  <Icon as={FileText} size={16} className="text-muted-foreground" />
                  <Text className="text-sm font-medium">Description</Text>
                </View>
                <Text className="text-sm text-muted-foreground">
                  {ticket.description}
                </Text>
              </View>
            ) : null}

            {relatedOrder ? (
              <View>
                <View className="flex-row items-center gap-2 mb-2">
                  <Icon as={Package} size={16} className="text-muted-foreground" />
                  <Text className="text-sm font-medium">Related CFS order</Text>
                </View>
                <Text className="text-sm text-muted-foreground">
                  {[relatedOrder.id, relatedOrder.blNo, relatedOrder.igmNo]
                    .filter(Boolean)
                    .join(" · ") || relatedOrder.id}
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onPress={() =>
                    router.push(
                      `/(protected)/cfs/order/view/${relatedOrder.id}` as any
                    )
                  }
                >
                  <Text>View order</Text>
                </Button>
              </View>
            ) : null}

            <View className="flex-row items-center gap-2 pt-2 border-t border-border">
              <Icon as={Calendar} size={14} className="text-muted-foreground" />
              <Text className="text-xs text-muted-foreground">
                Created {formatDate(ticket.created)}
                {ticket.updated && ticket.updated !== ticket.created
                  ? ` · Updated ${formatDate(ticket.updated)}`
                  : ""}
              </Text>
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6 items-center">
            <Icon as={MessageCircle} size={32} className="text-muted-foreground mb-2" />
            <Text className="text-sm text-muted-foreground text-center mb-4">
              Chat with support about this ticket.
            </Text>
            <Button
              onPress={async () => {
                if (!ticketId) return;
                const res = await getOrCreateTicketChatSession(ticketId);
                if (res.success && res.output) {
                  router.push(`/(protected)/chat/${res.output.id}` as any);
                } else {
                  Alert.alert("Error", res.message ?? "Could not open chat.");
                }
              }}
            >
              <Icon as={MessageCircle} size={18} className="mr-2" />
              <Text>Open chat</Text>
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </>
  );
}
