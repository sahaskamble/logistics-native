import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";

type TransportServiceRequestStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";

type TransportServiceRequestRecord = {
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

export default function TransportServiceRequestViewPage() {
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
  const [record, setRecord] = useState<TransportServiceRequestRecord | null>(null);

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
          title: `Request ${record.id}`,
          headerRight: () => (
            <Button
              variant="outline"
              onPress={() =>
                router.push({
                  pathname: "/(protected)/transport/service-requests/edit/[recordId]" as any,
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
              <CardTitle>transport_service_requests</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="id" value={record.id} />
              <InfoRow label="status" value={record.status} />
              <InfoRow label="order (relation)" value={record.order} />
              <InfoRow label="user (relation)" value={record.user} />
              <InfoRow label="serviceType (relation)" value={record.serviceType} />
              <InfoRow label="customerRemarks" value={record.customerRemarks} />
              <InfoRow label="reason" value={record.reason} />
              <InfoRow label="merchantVerified" value={record.merchantVerified} />
              <InfoRow label="merchantVerifiedBy (relation)" value={record.merchantVerifiedBy} />
              <InfoRow label="golVerified" value={record.golVerified} />
              <InfoRow label="golVerifiedBy (relation)" value={record.golVerifiedBy} />
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

