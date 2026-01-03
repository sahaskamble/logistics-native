import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

import { deleteCfsOrdersBulk, listCfsOrdersForCurrentUser, type CfsOrderRecord } from "@/lib/actions/cfs/fetch";

function formatCreatedDate(created?: string) {
  if (!created) return "";
  try {
    return new Date(created).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return created;
  }
}

function getStatusBadgeVariant(status?: CfsOrderRecord["status"]) {
  switch (status) {
    case "Pending":
      return "default";
    case "In Progress":
      return "secondary";
    case "Rejected":
      return "destructive";
    case "Completed":
      return "outline";
    case "Accepted":
      return "secondary";
    default:
      return "outline";
  }
}

export default function CfsOrdersListPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [orders, setOrders] = useState<CfsOrderRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectionMode = selectedIds.length > 0;

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const fetchOrders = useCallback(async () => {
    const res = await listCfsOrdersForCurrentUser();
    if (!res.success) {
      Alert.alert("Error", res.message);
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

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return Array.from(set);
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;

    Alert.alert(
      "Delete selected orders?",
      `You are about to delete ${selectedIds.length} order(s). This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (deleting) return;
              setDeleting(true);

              const res = await deleteCfsOrdersBulk(selectedIds);
              if (!res.success) {
                Alert.alert("Error", res.message);
                return;
              }

              await fetchOrders();
              clearSelection();
              Alert.alert("Success", res.message);
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Failed to delete orders.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [clearSelection, deleting, fetchOrders, selectedIds]);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: selectionMode ? `${selectedIds.length} selected` : "Orders",
          headerRight: selectionMode
            ? () => (
              <Button variant="destructive" disabled={deleting} onPress={handleDeleteSelected}>
                {deleting ? <ActivityIndicator color="white" /> : <Text className="text-white">Delete</Text>}
              </Button>
            )
            : undefined,
        }}
      />

      <ScrollView
        className="flex-1 bg-background"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-4 gap-4">
          {loading ? (
            <View className="items-center justify-center py-10">
              <ActivityIndicator />
              <Text className="mt-2 text-muted-foreground">Loading orders...</Text>
            </View>
          ) : orders.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Text className="text-muted-foreground">You haven't created any CFS orders yet.</Text>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => {
              const title = order.orderDescription || order.blNo || `Order #${order.id.slice(0, 8)}`;
              const isSelected = selectedSet.has(order.id);

              return (
                <Pressable
                  key={order.id}
                  onLongPress={() => toggleSelection(order.id)}
                  onPress={() => {
                    if (selectionMode) {
                      toggleSelection(order.id);
                      return;
                    }
                    router.push({
                      pathname: "/(protected)/orders/cfs/[orderId]",
                      params: { orderId: order.id },
                    } as any);
                  }}
                  delayLongPress={300}
                >
                  <Card className={isSelected ? "border-primary bg-muted p-0" : ""}>
                    <CardContent className="px-4">
                      <View className="w-full flex-row items-start justify-between gap-3 border-2 border-black">
                        <View className="w-full flex-1 gap-1">
                          <View className="w-full flex-row items-center justify-between gap-2">
                            <Text className="font-semibold text-base" numberOfLines={1}>
                              {title}
                            </Text>
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              <Text className="text-xs">{order.status || "Unknown"}</Text>
                            </Badge>
                          </View>
                          <Text className="text-xs text-muted-foreground">{formatCreatedDate(order.created)}</Text>
                        </View>

                        {selectionMode && (
                          <Text className={isSelected ? "text-primary font-semibold" : "text-muted-foreground"}>
                            {isSelected ? "Selected" : "Tap"}
                          </Text>
                        )}
                      </View>
                    </CardContent>
                  </Card>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </>
  );
}
