import { useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type TransportOrderStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "In Transit" | "Delivered";

export type TransportOrderRecord = {
  id: string;
  consigneeName?: string;
  chaName?: string;
  provider?: string;
  customer?: string;
  startDate?: string;
  startLocation?: string;
  endDate?: string;
  endLocation?: string;
  specialRequest?: string;
  vehicleDescription?: string;
  orderDescription?: string;
  createdBy?: string;
  reason?: string;
  status?: TransportOrderStatus;
  files?: string[];
  merchantVerified?: boolean;
  merchantVerifiedBy?: string;
  golVerified?: boolean;
  golVerifiedBy?: string;
  created?: string;
  updated?: string;
  expand?: any;
};

function getStatusConfig(status?: TransportOrderStatus) {
  switch (status) {
    case "Pending":
      return { variant: "default" as const, bgColor: "bg-yellow-500" };
    case "Accepted":
      return { variant: "secondary" as const, bgColor: "bg-green-500" };
    case "In Progress":
      return { variant: "secondary" as const, bgColor: "bg-gray-400" };
    case "In Transit":
      return { variant: "secondary" as const, bgColor: "bg-blue-500" };
    case "Rejected":
      return { variant: "destructive" as const, bgColor: "bg-red-500" };
    case "Delivered":
      return { variant: "outline" as const, bgColor: "bg-emerald-600" };
    default:
      return { variant: "outline" as const, bgColor: "bg-muted-background" };
  }
}

export default function TransportOrdersListPage() {
  // TODO: Implement actual API calls using PocketBase schema fields
  // TODO: Implement Transport-specific validation rules
  // TODO: Implement real-time updates for transport_orders
  // TODO: Implement file upload logic according to PocketBase rules
  // TODO: Implement status transitions exactly as defined in backend
  // TODO: Implement service-type specific business rules
  // TODO: Implement filtering, search, pagination (matching webapp logic)

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // UI-only skeleton state (no API yet)
  const [orders] = useState<TransportOrderRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<TransportOrderStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = orders;
    if (selectedStatus !== "All") list = list.filter((o) => o.status === selectedStatus);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((o) => (o.id || "").toLowerCase().includes(q));
  }, [orders, searchQuery, selectedStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    // Placeholder: no API yet
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Transport Orders",
          headerRight: () => (
            <Button onPress={() => router.push("/(protected)/transport/order/create")}>
              <Text>New Order</Text>
            </Button>
          ),
        }}
      />

      <ScrollView
        className="flex-1 bg-background"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Search by Order ID</Text>
                <Input value={searchQuery} onChangeText={setSearchQuery} placeholder="ORD-..." autoCapitalize="characters" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Status</Text>
                <View className="flex-row flex-wrap gap-2">
                  {(["All", "Pending", "Accepted", "In Progress", "In Transit", "Delivered", "Rejected"] as const).map(
                    (s) => (
                      <Button
                        key={s}
                        variant={selectedStatus === s ? "default" : "outline"}
                        onPress={() => setSelectedStatus(s as any)}
                      >
                        <Text>{s}</Text>
                      </Button>
                    )
                  )}
                </View>
              </View>
            </CardContent>
          </Card>

          {filtered.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No transport orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Text className="text-muted-foreground">
                  Create your first Transport order to begin.
                </Text>
              </CardContent>
            </Card>
          ) : (
            filtered.map((o) => (
              <Pressable
                key={o.id}
                onPress={() =>
                  router.push({
                    pathname: "/(protected)/transport/order/view/[orderId]" as any,
                    params: { orderId: o.id },
                  })
                }
                onLongPress={() => Alert.alert("Selection", "Bulk actions will be added later.")}
              >
                <Card>
                  <CardHeader>
                    <View className="flex-row items-center justify-between">
                      <CardTitle>{o.id}</CardTitle>
                      <Badge variant={getStatusConfig(o.status).variant} className={getStatusConfig(o.status).bgColor}>
                        <Text className="text-xs text-white">{o.status || "Unknown"}</Text>
                      </Badge>
                    </View>
                  </CardHeader>
                  <CardContent className="gap-1">
                    {!!o.consigneeName && <Text className="text-sm">consigneeName: {o.consigneeName}</Text>}
                    {!!o.chaName && <Text className="text-sm">chaName: {o.chaName}</Text>}
                    {!!o.startLocation && <Text className="text-sm">startLocation: {o.startLocation}</Text>}
                    {!!o.endLocation && <Text className="text-sm">endLocation: {o.endLocation}</Text>}
                  </CardContent>
                </Card>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

