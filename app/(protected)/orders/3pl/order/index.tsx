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
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft, Edit, Trash2 } from "lucide-react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import LoadingView from "@/components/LoadingView";
import {
  list3plOrdersForCurrentUser,
  delete3plOrdersBulk,
  type ThreePlOrderRecord,
} from "@/lib/actions/3pl/fetch";
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
    });
  } catch {
    return created;
  }
}

type OrderStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";

function getStatusConfig(status?: string) {
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
      return { variant: "outline" as const, bgColor: "bg-muted" };
  }
}

export default function ThreePlOrdersListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [orders, setOrders] = useState<ThreePlOrderRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "All">("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectionMode = selectedIds.length > 0;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const [searchQuery, setSearchQuery] = useState("");

  const basePath = "/(protected)/orders/3pl/order";

  const fetchOrders = useCallback(async () => {
    const res = await list3plOrdersForCurrentUser();
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
              const res = await delete3plOrdersBulk(selectedIds);
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
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (o) =>
        o.id?.toLowerCase().includes(q) ||
        o.igmNo?.toLowerCase().includes(q) ||
        o.blNo?.toLowerCase().includes(q) ||
        o.itemNo?.toLowerCase().includes(q)
    );
  }, [orders, searchQuery, selectedStatus]);

  if (loading) {
    return <LoadingView LoadingText="Loading orders..." />;
  }

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "Pending").length,
      accepted: orders.filter((o) => o.status === "Accepted").length,
      inProgress: orders.filter((o) => o.status === "In Progress").length,
      rejected: orders.filter((o) => o.status === "Rejected").length,
      completed: orders.filter((o) => o.status === "Completed").length,
    };
  }, [orders]);

  const getStatusCount = (s: OrderStatus | "All") => {
    if (s === "All") return statusCounts.all;
    if (s === "In Progress") return statusCounts.inProgress;
    return (statusCounts as any)[s.toLowerCase()] ?? 0;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: selectionMode ? `${selectedIds.length} selected` : "3PL Orders",
          headerRight: selectionMode
            ? () => (
                <Button variant="destructive" disabled={deleting} onPress={handleDeleteSelected}>
                  {deleting ? <ActivityIndicator color="white" /> : <Text className="text-white">Delete</Text>}
                </Button>
              )
            : () => (
                <Button variant="default" onPress={() => router.push(`${basePath}/create`)}>
                  <Text>New Order</Text>
                </Button>
              ),
          headerLeft: () => (
            <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-full mr-2">
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />
      <View className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View className="px-4 py-2 flex-row flex-wrap gap-2">
            {(["All", "Pending", "Accepted", "In Progress", "Rejected", "Completed"] as const).map((s) => (
              <Button
                key={s}
                variant={selectedStatus === s ? "default" : "outline"}
                size="sm"
                onPress={() => setSelectedStatus(s)}
              >
                <Text>{s} ({getStatusCount(s)})</Text>
              </Button>
            ))}
          </View>
          <View className="px-4 pb-6 gap-4">
            <View>
              <Text className="text-lg font-semibold">My Orders</Text>
              <View className="py-2">
                <Input
                  placeholder="Search by Order ID, IGM, BL, Item No"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
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
                      : "You haven't created any 3PL orders yet."}
                  </Text>
                  {!searchQuery.trim() && (
                    <Button
                      className="mt-4"
                      onPress={() => router.push(`${basePath}/create`)}
                    >
                      <Text>Create 3PL Order</Text>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedSet.has(order.id);
                const createdLabel = formatCreatedDate(order.created);
                const renderRightActions = () => (
                  <View className="flex-row h-full rounded-xl overflow-hidden">
                    <Pressable
                      className="justify-center items-center px-6 bg-blue-100"
                      onPress={() => router.push({ pathname: `${basePath}/edit/[orderId]`, params: { orderId: order.id } })}
                    >
                      <Icon as={Edit} size={24} className="text-blue-500" />
                      <Text className="text-blue-500 text-sm mt-1">Edit</Text>
                    </Pressable>
                    <Pressable
                      className="justify-center items-center px-6 bg-red-100"
                      onPress={() =>
                        Alert.alert("Delete order?", "This will permanently delete this order.", [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: async () => {
                              try {
                                setDeleting(true);
                                const res = await delete3plOrdersBulk([order.id]);
                                if (res.success) {
                                  await fetchOrders();
                                  Alert.alert("Success", res.message);
                                } else {
                                  Alert.alert("Error", res.message);
                                }
                              } catch (err: any) {
                                Alert.alert("Error", err?.message || "Failed to delete.");
                              } finally {
                                setDeleting(false);
                              }
                            },
                          },
                        ])
                      }
                    >
                      <Icon as={Trash2} size={24} className="text-red-500" />
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
                        router.push({ pathname: `${basePath}/view/[orderId]`, params: { orderId: order.id } });
                      }}
                      delayLongPress={200}
                    >
                      <Card className={isSelected ? "border-primary bg-muted" : ""}>
                        <CardHeader>
                          <View className="flex-row items-center justify-between">
                            <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                            <Badge variant={getStatusConfig(order.status).variant} className={getStatusConfig(order.status).bgColor}>
                              <Text className="text-xs text-white">{order.status || "—"}</Text>
                            </Badge>
                          </View>
                        </CardHeader>
                        <CardContent className="gap-1">
                          {order.igmNo && <Text className="text-sm">IGM: {order.igmNo}</Text>}
                          {order.itemNo && <Text className="text-sm">Item: {order.itemNo}</Text>}
                          {order.blNo && <Text className="text-sm">BL: {order.blNo}</Text>}
                          {createdLabel && <Text className="text-sm text-muted-foreground">{createdLabel}</Text>}
                          {selectionMode && (
                            <Text className={isSelected ? "text-primary font-semibold" : "text-muted-foreground"}>
                              {isSelected ? "Selected" : "Tap to select"}
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
