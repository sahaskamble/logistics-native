import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";

type TransportPricingRequestStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";

type TransportPricingRequestRecord = {
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

export default function TransportPricingRequestViewPage() {
  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId: string }>();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<TransportPricingRequestRecord | null>(null);

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
          title: `Pricing Request ${record.id}`,
          headerRight: () => (
            <Button
              variant="outline"
              onPress={() =>
                router.push({
                  pathname: "/(protected)/transport/pricing-request/edit/[recordId]" as any,
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
              <CardTitle>transport_pricing_request</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="id" value={record.id} />
              <InfoRow label="status" value={record.status} />
              <InfoRow label="Start location" value={record.startLocation} />
              <InfoRow label="End location" value={record.endLocation} />
              <InfoRow label="Special request" value={record.specialRequest} />
              <InfoRow label="Preferable rate" value={record.preferableRate} />
              <InfoRow label="Containers per month" value={record.containersPerMonth} />
              <InfoRow label="Start date" value={record.startDate} />
              <InfoRow label="user (relation)" value={record.user} />
              <InfoRow label="serviceProvider (relation)" value={record.serviceProvider} />
              <InfoRow label="reason" value={record.reason} />
              <InfoRow label="golVerified" value={record.golVerified} />
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
