import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type TransportServiceRequestStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";

export type TransportServiceRequestRecord = {
  id: string;
  order?: string;
  user?: string;
  serviceType?: string;
  merchantVerified?: boolean;
  merchantVerifiedBy?: string;
  golVerified?: boolean;
  golVerifiedBy?: string;
  customerRemarks?: string;
  reason?: string;
  status?: TransportServiceRequestStatus;
  created?: string;
  updated?: string;
  expand?: any;
};

function getStatusConfig(status?: TransportServiceRequestStatus) {
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

export default function TransportServiceRequestsListPage() {
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
  const [records] = useState<TransportServiceRequestRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<TransportServiceRequestStatus | "All">("All");
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
          headerTitle: "Transport Service Requests",
          headerRight: () => (
            <Button onPress={() => router.push("/(protected)/transport/service-requests/create")}>
              <Text>New Request</Text>
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
                <Input value={searchQuery} onChangeText={setSearchQuery} placeholder="REQ-... / ORD-..." />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">status</Text>
                <View className="flex-row flex-wrap gap-2">
                  {(["All", "Pending", "Accepted", "In Progress", "Completed", "Rejected"] as const).map((s) => (
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
                <CardTitle>No service requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Text className="text-muted-foreground">
                  Create a Transport service request linked to a Transport order.
                </Text>
              </CardContent>
            </Card>
          ) : (
            filtered.map((r) => (
              <Pressable
                key={r.id}
                onPress={() =>
                  router.push({
                    pathname: "/(protected)/transport/service-requests/view/[recordId]" as any,
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
                    {!!r.serviceType && <Text className="text-sm">serviceType (relation): {r.serviceType}</Text>}
                    {!!r.customerRemarks && (
                      <Text className="text-sm text-muted-foreground" numberOfLines={3}>
                        customerRemarks: {r.customerRemarks}
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

