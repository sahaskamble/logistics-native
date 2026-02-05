import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  FileText,
  Ship,
  Building,
  User,
  CircleDot,
  LogIn,
  LogOut,
  Truck,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCfsOrderById,
  listCfsOrderMovementsByOrder,
  type CfsOrderRecord,
  type CfsOrderMovementRecord,
} from "@/lib/actions/cfs/fetch";

function formatDate(d: string | undefined): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return "—";
  }
}

type TimelineEvent = {
  id: string;
  type: "cfs_in" | "cfs_out" | "delivery";
  label: string;
  date: string;
  dateRaw: string;
  remarks?: string;
  movementId: string;
};

function getStatusConfig(status?: CfsOrderRecord["status"]) {
  switch (status) {
    case "Pending":
      return { variant: "default" as const, bgColor: "bg-yellow-500" };
    case "Accepted":
      return { variant: "secondary" as const, bgColor: "bg-green-500" };
    case "In Progress":
      return { variant: "secondary" as const, bgColor: "bg-gray-400" };
    case "Rejected":
      return { variant: "destructive" as const, bgColor: "bg-red-500" };
    case "Completed":
      return { variant: "outline" as const, bgColor: "bg-blue-500" };
    default:
      return { variant: "outline" as const, bgColor: "bg-muted-background" };
  }
}

function buildTimelineEvents(movements: CfsOrderMovementRecord[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  movements.forEach((m, idx) => {
    if (m.CFSIN && m.cfs_in_time) {
      events.push({
        id: `${m.id}-in`,
        type: "cfs_in",
        label: "CFS In",
        date: formatDate(m.cfs_in_time),
        dateRaw: m.cfs_in_time,
        remarks: m.remarks,
        movementId: m.id,
      });
    }
    if (m.CFSOUT && m.cfs_out_time) {
      events.push({
        id: `${m.id}-out`,
        type: "cfs_out",
        label: "CFS Out",
        date: formatDate(m.cfs_out_time),
        dateRaw: m.cfs_out_time,
        remarks: m.remarks,
        movementId: m.id,
      });
    }
    if (m.date_of_delivery) {
      events.push({
        id: `${m.id}-delivery`,
        type: "delivery",
        label: "Date of delivery",
        date: formatDate(m.date_of_delivery),
        dateRaw: m.date_of_delivery,
        remarks: m.remarks,
        movementId: m.id,
      });
    }
  });
  events.sort((a, b) => new Date(a.dateRaw).getTime() - new Date(b.dateRaw).getTime());
  return events;
}

function InfoRow({
  label,
  value,
  icon: IconComponent,
}: {
  label: string;
  value?: string | null;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const v = value === undefined || value === null || value === "" ? "—" : String(value);
  return (
    <View className="flex-row items-start gap-2 py-1">
      {IconComponent && (
        <Icon as={IconComponent} size={16} className="text-muted-foreground mt-0.5" />
      )}
      <View className="flex-1 min-w-0">
        <Text className="text-muted-foreground text-xs">{label}</Text>
        <Text className="text-sm" numberOfLines={3}>{v}</Text>
      </View>
    </View>
  );
}

export default function TrackTraceResultPage() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<CfsOrderRecord | null>(null);
  const [movements, setMovements] = useState<CfsOrderMovementRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const id = typeof orderId === "string" ? orderId : Array.isArray(orderId) ? orderId[0] : "";
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [orderRes, movementsRes] = await Promise.all([
        getCfsOrderById(id, { expand: "customer" }),
        listCfsOrderMovementsByOrder(id),
      ]);
      if (orderRes.success && orderRes.output) {
        setOrder(orderRes.output.order);
      } else {
        Alert.alert("Error", orderRes.message || "Failed to load order");
      }
      if (movementsRes.success && movementsRes.output) {
        setMovements(movementsRes.output);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const timelineEvents = useMemo(() => buildTimelineEvents(movements), [movements]);

  const formattedEta = useMemo(() => {
    const eta = (order as any)?.eta;
    if (!eta) return "—";
    try {
      const d = new Date(eta);
      if (Number.isNaN(d.getTime())) return "—";
      return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return "—";
    }
  }, [order]);

  const containersDisplay = useMemo(() => {
    const c = (order as any)?.containers;
    if (!c) return "—";
    if (Array.isArray(c) && c.length > 0) return c.join(", ");
    if (typeof c === "string" && c.trim()) return c;
    return "—";
  }, [order]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-muted-foreground">Loading order & movement...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Order not found</Text>
        <Button className="mt-4" onPress={() => router.back()}>
          <Text>Go back</Text>
        </Button>
      </View>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `Order #${order.id}`,
          headerLeft: () => (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.back()}
              className="rounded-full mr-2"
            >
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />

      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Order details card */}
        <View className="p-4">
          <Card>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <CardTitle className="flex-row items-center gap-2">
                  <Icon as={Package} size={20} />
                  Order details
                </CardTitle>
                <Badge variant={statusConfig.variant} className={statusConfig.bgColor}>
                  <Text className="text-xs text-white">{order.status || "Unknown"}</Text>
                </Badge>
              </View>
            </CardHeader>
            <CardContent className="gap-3">
              <InfoRow label="Order ID" value={order.id} icon={FileText} />
              <InfoRow label="BL No" value={order.blNo} icon={Ship} />
              <InfoRow label="IGM No" value={order.igmNo} icon={FileText} />
              <InfoRow label="Item No" value={order.itemNo} icon={FileText} />
              <InfoRow label="Containers" value={containersDisplay} icon={Package} />
              <InfoRow label="ETA" value={formattedEta} icon={Calendar} />
              <InfoRow label="Consignee" value={order.consigneeName} icon={Building} />
              <InfoRow label="CHA Name" value={order.chaName} icon={User} />
              {order.orderDescription ? (
                <InfoRow label="Description" value={order.orderDescription} icon={FileText} />
              ) : null}
            </CardContent>
          </Card>
        </View>

        {/* Timeline */}
        <View className="px-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Icon as={MapPin} size={20} />
            <Text className="text-lg font-semibold">Order movement</Text>
          </View>
          {timelineEvents.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <Text className="text-muted-foreground text-center">
                  No movement updates yet. Check back later.
                </Text>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-2 pb-4">
                {timelineEvents.map((event, index) => {
                  const isLast = index === timelineEvents.length - 1;
                  const IconComponent =
                    event.type === "cfs_in"
                      ? LogIn
                      : event.type === "cfs_out"
                        ? LogOut
                        : event.type === "delivery"
                          ? Truck
                          : CircleDot;
                  const dotColor =
                    event.type === "cfs_in"
                      ? "bg-blue-500"
                      : event.type === "cfs_out"
                        ? "bg-amber-500"
                        : "bg-green-500";
                  return (
                    <View key={event.id} className="flex-row">
                      <View className="w-8 items-center">
                        <View className={`w-3 h-3 rounded-full ${dotColor}`} />
                        {!isLast && (
                          <View className="w-0.5 min-h-[32px] bg-border mt-1" style={{ minHeight: 32 }} />
                        )}
                      </View>
                      <View className="flex-1 pb-6 pl-3">
                        <View className="flex-row items-center gap-2 flex-wrap">
                          <Icon as={IconComponent} size={16} className="text-foreground" />
                          <Text className="font-medium">{event.label}</Text>
                        </View>
                        <Text className="text-muted-foreground text-sm mt-0.5">{event.date}</Text>
                        {event.remarks ? (
                          <Text className="text-sm mt-1 text-foreground/90">{event.remarks}</Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </View>
      </ScrollView>
    </>
  );
}
