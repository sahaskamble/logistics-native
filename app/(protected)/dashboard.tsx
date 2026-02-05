import LoadingView from "@/components/LoadingView";
import OrderStats, { type OrderStatus } from "@/components/cfs/OrderStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { listCfsOrdersForCurrentUser, type CfsOrderRecord } from "@/lib/actions/cfs/fetch";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useEffect } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import { ChevronRight } from "lucide-react-native";

function formatCreatedDate(created?: string) {
  if (!created) return "";
  try {
    return new Date(created).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return created;
  }
}

function getStatusColor(status?: CfsOrderRecord["status"]) {
  switch (status) {
    case "Pending":
      return "#eab308";
    case "Accepted":
      return "#22c55e";
    case "In Progress":
      return "#9ca3af";
    case "Rejected":
      return "#ef4444";
    case "Completed":
      return "#3b82f6";
    default:
      return "#94a3b8";
  }
}

function getStatusLabel(status?: CfsOrderRecord["status"]) {
  if (!status) return "Unknown";
  return status;
}

function normalizeToYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<CfsOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "All">("All");

  const fetchOrders = useCallback(async () => {
    const res = await listCfsOrdersForCurrentUser({
      sort: "-created",
    });
    if (!res.success) {
      Alert.alert("Error", res.message);
      setOrders([]);
      return;
    }
    setOrders(res.output || []);
  }, []);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      try {
        await fetchOrders();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchOrders();
    } finally {
      setRefreshing(false);
    }
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (selectedStatus === "All") return orders;
    return orders.filter((o) => o.status === selectedStatus);
  }, [orders, selectedStatus]);

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of orders) {
      const k = getStatusLabel(o.status);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    return counts;
  }, [orders]);

  const statusPieData = useMemo(() => {
    const base: Array<{ value: number; color: string; text: string }> = [];
    for (const [status, count] of statusCounts.entries()) {
      base.push({
        value: count,
        color: getStatusColor(status as any),
        text: `${status} (${count})`,
      });
    }
    // Keep consistent ordering
    const priority = ["Pending", "Accepted", "In Progress", "Completed", "Rejected", "Unknown"];
    base.sort((a, b) => priority.indexOf(a.text.split(" (")[0]) - priority.indexOf(b.text.split(" (")[0]));
    return base;
  }, [statusCounts]);

  const last7DaysBarData = useMemo(() => {
    const today = new Date();
    const days: Array<{ ymd: string; label: string }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ymd = normalizeToYmd(d);
      const label = d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3);
      days.push({ ymd, label });
    }

    const counts = new Map<string, number>();
    for (const o of orders) {
      if (!o.created) continue;
      const d = new Date(o.created);
      if (Number.isNaN(d.getTime())) continue;
      const ymd = normalizeToYmd(d);
      counts.set(ymd, (counts.get(ymd) || 0) + 1);
    }

    return days.map((d) => ({
      value: counts.get(d.ymd) || 0,
      label: d.label,
      frontColor: "#3b82f6",
    }));
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...filteredOrders].slice(0, 5);
  }, [filteredOrders]);

  if (loading) {
    return <LoadingView LoadingText="Loading dashboard..." />;
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="px-4 pt-4">
        <Text className="text-muted-foreground mt-1">Your orders overview</Text>
      </View>

      <OrderStats orders={orders} selectedStatus={selectedStatus} onStatusChange={setSelectedStatus} />

      <View className="px-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {statusPieData.length === 0 ? (
              <Text className="text-muted-foreground">No orders yet.</Text>
            ) : (
              <View className="items-center">
                <PieChart
                  data={statusPieData}
                  radius={110}
                  innerRadius={60}
                  donut
                  centerLabelComponent={() => (
                    <View className="items-center">
                      <Text className="text-xl font-bold">{orders.length}</Text>
                      <Text className="text-xs text-muted-foreground">Total</Text>
                    </View>
                  )}
                />

                <View className="mt-4 w-full">
                  {statusPieData.map((s) => (
                    <View key={s.text} className="flex-row items-center justify-between py-1">
                      <View className="flex-row items-center gap-2">
                        <View
                          style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: s.color }}
                        />
                        <Text className="text-sm">{s.text.split(" (")[0]}</Text>
                      </View>
                      <Text className="text-sm text-muted-foreground">{s.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Orders Created (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={last7DaysBarData}
              barWidth={18}
              spacing={18}
              roundedTop
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              noOfSections={4}
              maxValue={Math.max(4, ...last7DaysBarData.map((d) => d.value))}
            />
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="gap-2">
            {recentOrders.length === 0 ? (
              <Text className="text-muted-foreground">No recent orders.</Text>
            ) : (
              recentOrders.map((o) => (
                <Pressable
                  key={o.id}
                  onPress={() =>
                    router.push({
                      pathname: "/(protected)/cfs/order/view/[orderId]",
                      params: { orderId: o.id },
                    })
                  }
                >
                  <View className="flex-row items-center justify-between py-3 border-b border-border">
                    <View className="flex-1 pr-3">
                      <Text className="font-semibold">#{o.id.slice(0, 8)}</Text>
                      <Text className="text-xs text-muted-foreground mt-1">{formatCreatedDate(o.created)}</Text>
                      <Text className="text-xs text-muted-foreground mt-1">Status: {getStatusLabel(o.status)}</Text>
                    </View>
                    <Icon as={ChevronRight} className="size-5 text-muted-foreground" />
                  </View>
                </Pressable>
              ))
            )}
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}

