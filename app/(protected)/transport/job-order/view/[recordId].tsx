import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";

type TransportJobOrderStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";

type TransportJobOrderRecord = {
  id: string;
  order?: string;
  fromDate?: string;
  toDate?: string;
  serviceType?: string;
  vehicles?: string[];
  remarks?: string;
  files?: string[];
  status?: TransportJobOrderStatus;
  createdBy?: string;
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

export default function TransportJobOrderViewPage() {
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
  const [record, setRecord] = useState<TransportJobOrderRecord | null>(null);

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
          title: `Job ${record.id}`,
          headerRight: () => (
            <Button
              variant="outline"
              onPress={() =>
                router.push({
                  pathname: "/(protected)/transport/job-order/edit/[recordId]" as any,
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
              <CardTitle>transport_job_order</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="id" value={record.id} />
              <InfoRow label="status" value={record.status} />
              <InfoRow label="order (relation)" value={record.order} />
              <InfoRow label="fromDate" value={record.fromDate} />
              <InfoRow label="toDate" value={record.toDate} />
              <InfoRow label="serviceType (relation)" value={record.serviceType} />
              <InfoRow label="vehicles (relation[])" value={(record.vehicles || []).join(", ")} />
              <InfoRow label="remarks" value={record.remarks} />
              <InfoRow label="files (file)" value={(record.files || []).join(", ")} />
              <InfoRow label="createdBy (relation)" value={record.createdBy} />
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

