import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";

type TransportOrderMovementStatus = "Not Started" | "In Transit" | "Delivered" | "Cancelled";

type TransportOrderMovementRecord = {
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

export default function TransportOrderMovementViewPage() {
  // TODO: Implement actual API calls using PocketBase schema fields
  // TODO: Implement Transport-specific validation rules
  // TODO: Implement real-time updates for transport_orders
  // TODO: Implement file upload logic according to PocketBase rules
  // TODO: Implement status transitions exactly as defined in backend
  // TODO: Implement service-type specific business rules
  // TODO: Implement filtering, search, pagination (matching webapp logic)

  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId: string }>();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<TransportOrderMovementRecord | null>(null);

  useEffect(() => {
    if (!recordId) {
      setLoading(false);
      return;
    }
    setLoading(false);
    setRecord({ id: recordId });
  }, [recordId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
        <Text className="mt-2">Loading...</Text>
      </View>
    );
  }

  if (!record) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Record not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Movement ${record.id}`,
          headerRight: () => (
            <Button
              variant="outline"
              onPress={() =>
                router.push({
                  pathname: "/(protected)/transport/order-movement/edit/[recordId]" as any,
                  params: { recordId: record.id },
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
              <CardTitle>transport_order_movement</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="id" value={record.id} />
              <InfoRow label="status" value={record.status} />
              <InfoRow label="order (relation)" value={record.order} />
              <InfoRow label="jobOrder (relation)" value={record.jobOrder} />
              <InfoRow label="vehicle (relation)" value={record.vehicle} />
              <InfoRow label="driver (json)" value={record.driver ? JSON.stringify(record.driver) : ""} />
              <InfoRow label="startDate" value={record.startDate} />
              <InfoRow label="endDate" value={record.endDate} />
              <InfoRow label="startLocation (geoPoint)" value={record.startLocation ? JSON.stringify(record.startLocation) : ""} />
              <InfoRow label="currentLocation (geoPoint)" value={record.currentLocation ? JSON.stringify(record.currentLocation) : ""} />
              <InfoRow label="endLocation (geoPoint)" value={record.endLocation ? JSON.stringify(record.endLocation) : ""} />
              <InfoRow label="remarks" value={record.remarks} />
              <InfoRow label="created" value={record.created} />
              <InfoRow label="updated" value={record.updated} />
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

