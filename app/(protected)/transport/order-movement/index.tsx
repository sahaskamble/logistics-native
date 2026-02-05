import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type TransportOrderMovementStatus = "Not Started" | "In Transit" | "Delivered" | "Cancelled";

export type TransportOrderMovementRecord = {
  id: string;
  order?: string;
  jobOrder?: string;
  vehicle?: string;
  driver?: any;
  startDate?: string;
  endDate?: string;
  startLocation?: any;
  currentLocation?: any;
  endLocation?: any;
  remarks?: string;
  status?: TransportOrderMovementStatus;
  created?: string;
  updated?: string;
  expand?: any;
};

function getStatusConfig(status?: TransportOrderMovementStatus) {
  switch (status) {
    case "Not Started":
      return { variant: "outline" as const, bgColor: "bg-muted-background" };
    case "In Transit":
      return { variant: "secondary" as const, bgColor: "bg-blue-500" };
    case "Delivered":
      return { variant: "outline" as const, bgColor: "bg-emerald-600" };
    case "Cancelled":
      return { variant: "destructive" as const, bgColor: "bg-red-500" };
    default:
      return { variant: "outline" as const, bgColor: "bg-muted-background" };
  }
}

export default function TransportOrderMovementsListPage() {
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
  const [records] = useState<TransportOrderMovementRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<TransportOrderMovementStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = records;
    if (selectedStatus !== "All") list = list.filter((r) => r.status === selectedStatus);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => (r.id || "").toLowerCase().includes(q) || (r.order || "").toLowerCase().includes(q));
  }, [records, searchQuery, selectedStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Transport Order Movements",
          headerRight: () => (
            <Button onPress={() => router.push("/(protected)/transport/order-movement/create")}>
              <Text>New</Text>
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
                <Text className="text-sm text-muted-foreground">Search by id / order</Text>
                <Input value={searchQuery} onChangeText={setSearchQuery} placeholder="..." />
              </View>
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">status</Text>
                <View className="flex-row flex-wrap gap-2">
                  {(["All", "Not Started", "In Transit", "Delivered", "Cancelled"] as const).map((s) => (
                    <Button key={s} variant={selectedStatus === s ? "default" : "outline"} onPress={() => setSelectedStatus(s as any)}>
                      <Text>{s}</Text>
                    </Button>
                  ))}
                </View>
              </View>
            </CardContent>
          </Card>

          {filtered.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No order movements</CardTitle>
              </CardHeader>
              <CardContent>
                <Text className="text-muted-foreground">
                  This screen mirrors the PocketBase collection `transport_order_movement`.
                </Text>
              </CardContent>
            </Card>
          ) : (
            filtered.map((r) => (
              <Pressable
                key={r.id}
                onPress={() =>
                  router.push({
                    pathname: "/(protected)/transport/order-movement/view/[recordId]" as any,
                    params: { recordId: r.id },
                  })
                }
              >
                <Card>
                  <CardHeader>
                    <View className="flex-row items-center justify-between">
                      <CardTitle>{r.id}</CardTitle>
                      <Badge variant={getStatusConfig(r.status).variant} className={getStatusConfig(r.status).bgColor}>
                        <Text className="text-xs text-white">{r.status || "Unknown"}</Text>
                      </Badge>
                    </View>
                  </CardHeader>
                  <CardContent className="gap-1">
                    {!!r.order && <Text className="text-sm">order: {r.order}</Text>}
                    {!!r.vehicle && <Text className="text-sm">vehicle (relation): {r.vehicle}</Text>}
                    {!!r.remarks && (
                      <Text className="text-sm text-muted-foreground" numberOfLines={3}>
                        remarks: {r.remarks}
                      </Text>
                    )}
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

