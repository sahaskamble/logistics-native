import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type TransportPricingRequestStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";

export type TransportPricingRequestRecord = {
  id: string;
  user?: string;
  serviceProvider?: string;
  startDate?: string;
  startLocation?: string;
  endLocation?: string;
  specialRequest?: string;
  golVerified?: boolean;
  golVerifiedBy?: string;
  preferableRate?: number;
  containersPerMonth?: number;
  status?: TransportPricingRequestStatus;
  reason?: string;
  created?: string;
  updated?: string;
  expand?: any;
};

function getStatusConfig(status?: TransportPricingRequestStatus) {
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

export default function TransportPricingRequestListPage() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const [records] = useState<TransportPricingRequestRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<TransportPricingRequestStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = records;
    if (selectedStatus !== "All") list = list.filter((r) => r.status === selectedStatus);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        (r.id || "").toLowerCase().includes(q) ||
        (r.startLocation || "").toLowerCase().includes(q) ||
        (r.endLocation || "").toLowerCase().includes(q)
    );
  }, [records, searchQuery, selectedStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Pricing Request",
          headerRight: () => (
            <Button onPress={() => router.push("/(protected)/transport/pricing-request/create")}>
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
                <Text className="text-sm text-muted-foreground">Search by id / location</Text>
                <Input value={searchQuery} onChangeText={setSearchQuery} placeholder="Search..." />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Status</Text>
                <View className="flex-row flex-wrap gap-2">
                  {(["All", "Pending", "Accepted", "In Progress", "Completed", "Rejected"] as const).map((s) => (
                    <Button
                      key={s}
                      variant={selectedStatus === s ? "default" : "outline"}
                      onPress={() => setSelectedStatus(s as any)}
                    >
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
                <CardTitle>No pricing requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Text className="text-muted-foreground">
                  Create a Transport pricing request for start/end location and rate.
                </Text>
              </CardContent>
            </Card>
          ) : (
            filtered.map((r) => (
              <Pressable
                key={r.id}
                onPress={() =>
                  router.push({
                    pathname: "/(protected)/transport/pricing-request/view/[recordId]" as any,
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
                    {!!r.startLocation && <Text className="text-sm">From: {r.startLocation}</Text>}
                    {!!r.endLocation && <Text className="text-sm">To: {r.endLocation}</Text>}
                    {r.preferableRate != null && <Text className="text-sm">Rate: {r.preferableRate}</Text>}
                    {!!r.specialRequest && (
                      <Text className="text-sm text-muted-foreground" numberOfLines={2}>
                        {r.specialRequest}
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
