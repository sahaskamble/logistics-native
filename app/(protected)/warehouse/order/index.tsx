import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import {
  deleteWarehouseOrdersBulk,
  listWarehouseOrdersForCurrentUser,
  type WarehouseOrderRecord,
} from "@/lib/actions/warehouse/fetch";
import OrderStats, { type OrderStatus } from "@/components/cfs/OrderStats";
import type { CfsOrderRecord } from "@/lib/actions/cfs/fetch";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft, Edit, Trash2 } from "lucide-react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import LoadingView from "@/components/LoadingView";

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

function getStatusConfig(status?: WarehouseOrderRecord["status"]) {
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

export default function WarehouseOrdersListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [orders, setOrders] = useState<WarehouseOrderRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "All">("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectionMode = selectedIds.length > 0;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchOrders = useCallback(async () => {
    const res = await listWarehouseOrdersForCurrentUser();
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
              const res = await deleteWarehouseOrdersBulk(selectedIds);
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

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (selectedStatus !== "All") {
      list = list.filter((o) => o.status === selectedStatus);
    }
    if (!searchQuery.trim()) return list;
    const lower = searchQuery.toLowerCase().trim();
    return list.filter(
      (o) =>
        o.id.toLowerCase().includes(lower) ||
        (o.blNo && o.blNo.toLowerCase().includes(lower)) ||
        (o.igmNo && o.igmNo.toLowerCase().includes(lower)) ||
        (o.itemNo && o.itemNo.toLowerCase().includes(lower))
    );
  }, [orders, searchQuery, selectedStatus]);

  if (loading) {
    return <LoadingView LoadingText="Loading Orders..." />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: selectionMode ? `${selectedIds.length} selected` : "Warehouse Orders",
          headerRight: selectionMode
            ? () => (
                <Button variant="destructive" disabled={deleting} onPress={handleDeleteSelected}>
                  {deleting ? <ActivityIndicator color="white" /> : <Text className="text-white">Delete</Text>}
                </Button>
              )
            : () => (
                <Button variant="default" onPress={() => router.push("/(protected)/warehouse/order/create")}>
                  <Text>New Order</Text>
                </Button>
              ),
          headerLeft: () => (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.replace("/(protected)/home")}
              className="rounded-full mr-2"
            >
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />
      <View className="flex-1 bg-background/80">
        <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <OrderStats
            orders={orders as unknown as CfsOrderRecord[]}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
          <View className="px-4 pb-6 gap-4">
            <View>
              <Text className="text-xl font-bold">My Warehouse Orders</Text>
              <View className="py-2">
                <Input
                  placeholder="Search Order ID, BL, IGM, Item No"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  clearButtonMode="while-editing"
                  autoCapitalize="characters"
                />
              </View>
            </View>
            {filteredOrders.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>{searchQuery.trim() ? "No matching orders" : "No orders"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text className="text-muted-foreground">
                    {searchQuery.trim()
                      ? `No orders found matching "${searchQuery}"`
                      : "You haven't created any warehouse orders yet."}
                  </Text>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => {
                const title = `Order #${order.id}`;
                const isSelected = selectedSet.has(order.id);
                const createdLabel = formatCreatedDate(order.created);
                const renderRightActions = () => (
                  <View className="flex-row h-full rounded-xl overflow-hidden">
                    <Pressable
                      className="justify-center items-center px-6"
                      onPress={() =>
                        router.push({
                          pathname: "/(protected)/warehouse/order/edit/[orderId]",
                          params: { orderId: order.id },
                        })
                      }
                    >
                      <Icon as={Edit} className="size-6 text-blue-500" />
                      <Text className="text-blue-500 text-sm mt-1">Edit</Text>
                    </Pressable>
                    <Pressable
                      className="justify-center items-center px-6"
                      onPress={() => {
                        Alert.alert("Delete order?", "This will permanently delete this order.", [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: async () => {
                              try {
                                if (deleting) return;
                                setDeleting(true);
                                const res = await deleteWarehouseOrdersBulk([order.id]);
                                if (!res.success) {
                                  Alert.alert("Error", res.message);
                                  return;
                                }
                                await fetchOrders();
                                setSelectedIds((prev) => prev.filter((x) => x !== order.id));
                                Alert.alert("Success", res.message);
                              } catch (err: any) {
                                Alert.alert("Error", err?.message || "Failed to delete order.");
                              } finally {
                                setDeleting(false);
                              }
                            },
                          },
                        ]);
                      }}
                    >
                      <Icon as={Trash2} className="size-6 text-red-500" />
                      <Text className="text-red-500 text-sm mt-1">Delete</Text>
                    </Pressable>
                  </View>
                );
                return (
                  <Swipeable
                    key={order.id}
                    renderRightActions={renderRightActions}
                    overshootRight={false}
                    enabled={!selectionMode}
                  >
                    <Pressable
                      onLongPress={() => toggleSelection(order.id)}
                      onPress={() => {
                        if (selectionMode) {
                          toggleSelection(order.id);
                          return;
                        }
                        router.push({
                          pathname: "/(protected)/warehouse/order/view/[orderId]",
                          params: { orderId: order.id },
                        });
                      }}
                      delayLongPress={100}
                    >
                      <Card className={`${isSelected ? "border-primary bg-muted" : ""}`}>
                        <CardHeader>
                          <View className="flex-row items-center justify-between">
                            <CardTitle>{title}</CardTitle>
                            <Badge variant={getStatusConfig(order.status).variant} className={getStatusConfig(order.status).bgColor}>
                              <Text className="text-xs text-white">{order.status || "Unknown"}</Text>
                            </Badge>
                          </View>
                        </CardHeader>
                        <CardContent className="gap-1">
                          {!!order.igmNo && <Text className="text-sm">IGM-No: {order.igmNo}</Text>}
                          {!!order.itemNo && <Text className="text-sm">Item-No: {order.itemNo}</Text>}
                          {!!order.blNo && <Text className="text-sm">BL-No: {order.blNo}</Text>}
                          {!!createdLabel && <Text className="text-sm">{createdLabel}</Text>}
                          {selectionMode && (
                            <Text className={isSelected ? "text-primary font-semibold" : "text-muted-foreground"}>
                              {isSelected ? "Selected" : "Tap"}
                            </Text>
                          )}
                        </CardContent>
                      </Card>
                    </Pressable>
                  </Swipeable>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
