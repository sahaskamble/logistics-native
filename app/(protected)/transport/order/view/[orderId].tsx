import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";

type TransportOrderStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "In Transit" | "Delivered";

type TransportOrderRecord = {
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

function InfoRow({ label, value }: { label: string; value?: any }) {
  const v = value === undefined || value === null || value === "" ? "-" : String(value);
  return (
    <>
      <View className="gap-1">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        <Text className="text-base font-medium">{v}</Text>
      </View>
      <Separator className="my-2" />
    </>
  );
}

export default function TransportOrderViewPage() {
  // TODO: Implement actual API calls using PocketBase schema fields
  // TODO: Implement Transport-specific validation rules
  // TODO: Implement real-time updates for transport_orders
  // TODO: Implement file upload logic according to PocketBase rules
  // TODO: Implement status transitions exactly as defined in backend
  // TODO: Implement service-type specific business rules
  // TODO: Implement filtering, search, pagination (matching webapp logic)

  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<TransportOrderRecord | null>(null);

  useEffect(() => {
    // No API yet; keep a skeleton
    if (!orderId) {
      setLoading(false);
      return;
    }
    setLoading(false);
    setOrder({ id: orderId });
  }, [orderId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
        <Text className="mt-2">Loading transport order...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Transport order not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Order ${order.id}`,
          headerRight: () => (
            <Button
              variant="outline"
              onPress={() =>
                router.push({
                  pathname: "/(protected)/transport/order/edit/[orderId]" as any,
                  params: { orderId: order.id },
                })
              }
            >
              <Text>Edit</Text>
            </Button>
          ),
        }}
      />

      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>transport_orders</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="id" value={order.id} />
              <InfoRow label="status" value={order.status} />

              <InfoRow label="consigneeName" value={order.consigneeName} />
              <InfoRow label="chaName" value={order.chaName} />

              <InfoRow label="provider (relation)" value={order.provider} />
              <InfoRow label="customer (relation)" value={order.customer} />
              <InfoRow label="createdBy (relation)" value={order.createdBy} />

              <InfoRow label="startDate" value={order.startDate} />
              <InfoRow label="startLocation" value={order.startLocation} />
              <InfoRow label="endDate" value={order.endDate} />
              <InfoRow label="endLocation" value={order.endLocation} />

              <InfoRow label="vehicleDescription" value={order.vehicleDescription} />
              <InfoRow label="specialRequest" value={order.specialRequest} />
              <InfoRow label="orderDescription" value={order.orderDescription} />
              <InfoRow label="reason" value={order.reason} />

              <InfoRow label="files (file)" value={(order.files || []).join(", ")} />

              <InfoRow label="merchantVerified" value={order.merchantVerified} />
              <InfoRow label="merchantVerifiedBy (relation)" value={order.merchantVerifiedBy} />
              <InfoRow label="golVerified" value={order.golVerified} />
              <InfoRow label="golVerifiedBy (relation)" value={order.golVerifiedBy} />

              <InfoRow label="created" value={order.created} />
              <InfoRow label="updated" value={order.updated} />
            </CardContent>
          </Card>

          <Button
            variant="destructive"
            onPress={() => Alert.alert("Not implemented", "Delete will be wired in the action layer later.")}
          >
            <Text>Delete</Text>
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

