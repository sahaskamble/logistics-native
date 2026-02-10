import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getWarehouseOrderById, type WarehouseOrderRecord } from "@/lib/actions/warehouse/fetch";
import LoadingView from "@/components/LoadingView";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft, Edit } from "lucide-react-native";

function formatDate(s?: string) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

function getStatusConfig(status?: string) {
  switch (status) {
    case "Pending":
      return "bg-yellow-500";
    case "Accepted":
      return "bg-green-500";
    case "In Progress":
      return "bg-gray-400";
    case "Rejected":
      return "bg-red-500";
    case "Completed":
      return "bg-blue-500";
    default:
      return "bg-muted";
  }
}

export default function WarehouseOrderViewPage() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<WarehouseOrderRecord | null>(null);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      setLoading(true);
      const res = await getWarehouseOrderById(orderId);
      if (res.success && res.output) setOrder(res.output);
      else Alert.alert("Error", res.message || "Failed to load order");
      setLoading(false);
    })();
  }, [orderId]);

  if (loading) return <LoadingView LoadingText="Loading..." />;
  if (!order) return null;

  const containers = Array.isArray(order.containers) ? (order.containers as string[]) : [];

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `Order #${orderId}`,
          headerLeft: () => (
            <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-full mr-2">
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
          headerRight: () => (
            <Button
              variant="outline"
              size="icon"
              onPress={() =>
                router.push({
                  pathname: "/(protected)/warehouse/order/edit/[orderId]",
                  params: { orderId: order.id },
                })
              }
            >
              <Icon as={Edit} size={20} />
            </Button>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background">
        <Card className="m-4">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Warehouse Order</CardTitle>
            <Badge className={getStatusConfig(order.status)}>
              <Text className="text-xs text-white">{order.status || "—"}</Text>
            </Badge>
          </CardHeader>
          <CardContent className="gap-3">
            <View>
              <Text className="text-sm text-muted-foreground">IGM No</Text>
              <Text className="text-base">{order.igmNo || "—"}</Text>
            </View>
            <View>
              <Text className="text-sm text-muted-foreground">BL No</Text>
              <Text className="text-base">{order.blNo || "—"}</Text>
            </View>
            <View>
              <Text className="text-sm text-muted-foreground">Item No</Text>
              <Text className="text-base">{order.itemNo || "—"}</Text>
            </View>
            <View>
              <Text className="text-sm text-muted-foreground">Consignee Name</Text>
              <Text className="text-base">{order.consigneeName || "—"}</Text>
            </View>
            <View>
              <Text className="text-sm text-muted-foreground">CHA Name</Text>
              <Text className="text-base">{order.chaName || "—"}</Text>
            </View>
            {containers.length > 0 && (
              <View>
                <Text className="text-sm text-muted-foreground">Containers</Text>
                <Text className="text-base">{containers.join(", ")}</Text>
              </View>
            )}
            <View>
              <Text className="text-sm text-muted-foreground">Created</Text>
              <Text className="text-base">{formatDate(order.created)}</Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </>
  );
}
