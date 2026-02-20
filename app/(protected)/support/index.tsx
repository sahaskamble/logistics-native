import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Plus, Ticket, Package } from "lucide-react-native";
import LoadingView from "@/components/LoadingView";
import {
  listTicketsForCurrentUser,
  type TicketRecord,
  type TicketStatus,
} from "@/lib/actions/support";

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

function getPriorityLabel(priority?: TicketRecord["priority"]) {
  switch (priority) {
    case "Urgent":
      return "Urgent";
    case "High":
      return "High";
    case "Medium":
      return "Medium";
    case "Low":
      return "Low";
    default:
      return priority ?? "—";
  }
}

function TicketCard({
  ticket,
  onPress,
}: {
  ticket: TicketRecord;
  onPress: () => void;
}) {
  const relatedOrder = ticket.expand?.relatedOrderid as { id?: string; blNo?: string; igmNo?: string } | undefined;
  const orderLabel = relatedOrder
    ? [relatedOrder.id, relatedOrder.blNo, relatedOrder.igmNo].filter(Boolean).join(" · ") || relatedOrder.id
    : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="mb-3">
        <CardHeader>
          <View className="flex-row items-start justify-between gap-2">
            <CardTitle className="flex-1 text-base" numberOfLines={2}>
              {ticket.subject || "No subject"}
            </CardTitle>
            <Badge variant={getStatusVariant(ticket.status)}>
              <Text className="text-xs">{ticket.status?.replace("_", " ") ?? "—"}</Text>
            </Badge>
          </View>
        </CardHeader>
        <CardContent>
          {ticket.description ? (
            <Text className="text-sm text-muted-foreground mb-2" numberOfLines={2}>
              {ticket.description}
            </Text>
          ) : null}
          {orderLabel ? (
            <View className="flex-row items-center gap-1.5 mb-2">
              <Icon as={Package} size={14} className="text-muted-foreground" />
              <Text className="text-xs text-muted-foreground">Order: {orderLabel}</Text>
            </View>
          ) : null}
          <View className="flex-row items-center justify-between flex-wrap gap-2">
            <Text className="text-xs text-muted-foreground">
              {formatDate(ticket.created)}
            </Text>
            <View className="flex-row items-center gap-2">
              <Badge variant="outline">
                <Text className="text-xs">{getPriorityLabel(ticket.priority)}</Text>
              </Badge>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}

export default function SupportTicketsListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);

  const fetchTickets = useCallback(async () => {
    const res = await listTicketsForCurrentUser({
      expand: "customer,assigned_to,relatedOrderid",
      sort: "-created",
    });
    if (res.success && res.output) {
      setTickets(res.output);
    } else {
      if (!res.success) Alert.alert("Error", res.message);
      setTickets([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await fetchTickets();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchTickets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  }, [fetchTickets]);

  if (loading) {
    return <LoadingView LoadingText="Loading tickets..." />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button
              variant="default"
              size="sm"
              onPress={() => router.push("/(protected)/support/create")}
            >
              <Icon as={Plus} size={18} className="mr-1" />
              <Text>New</Text>
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
        {tickets.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="py-12 items-center">
              <Icon as={Ticket} size={48} className="text-muted-foreground mb-4" />
              <Text className="text-lg font-semibold text-center mb-2">No tickets yet</Text>
              <Text className="text-sm text-muted-foreground text-center mb-6">
                Create a support ticket for general help or link one to a CFS order.
              </Text>
              <Button
                onPress={() => router.push("/(protected)/support/create")}
              >
                <Icon as={Plus} size={18} className="mr-2" />
                <Text>Create ticket</Text>
              </Button>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onPress={() =>
                router.push(`/(protected)/support/${ticket.id}` as any)
              }
            />
          ))
        )}
      </ScrollView>
    </>
  );
}
