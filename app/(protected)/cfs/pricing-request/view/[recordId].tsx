import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import LoadingView from "@/components/LoadingView";

import { getCfsPricingRequestById } from "@/lib/actions/cfs/pricingRequest";
import type { CfsPricingRequestRecord } from "@/lib/actions/cfs/pricingRequest";

const BASE_PATH = "/(protected)/cfs/pricing-request";

function getProviderName(r: CfsPricingRequestRecord): string {
  const expanded = (r as any).expand?.serviceProvider;
  if (expanded?.title) return expanded.title;
  return r.serviceProvider ? `Provider ${String(r.serviceProvider).slice(0, 8)}` : "—";
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <>
      <View className="gap-1">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        <Text className="text-base">{value || "—"}</Text>
      </View>
      <Separator className="my-2" />
    </>
  );
}

export default function CfsPricingRequestViewPage() {
  const { recordId } = useLocalSearchParams<{ recordId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<CfsPricingRequestRecord | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!recordId) return;
      setLoading(true);
      const res = await getCfsPricingRequestById(recordId, { expand: "serviceProvider" });
      if (!res.success) {
        Alert.alert("Error", res.message);
        setRecord(null);
      } else {
        setRecord(res.output);
      }
      setLoading(false);
    };
    load();
  }, [recordId]);

  if (loading) return <LoadingView LoadingText="Loading request..." />;
  if (!record) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Request not found</Text>
      </View>
    );
  }

  const extra = record.extra_info;
  const twentyft = extra?.twentyft;
  const fortyft = extra?.fortyft;

  return (
    <>
      <Stack.Screen
        options={{
          title: `Request ${record.id}`,
          headerRight: () => (
            <Button variant="outline" onPress={() => router.push(`${BASE_PATH}/edit/${record.id}` as any)}>
              <Text>Edit</Text>
            </Button>
          ),
          headerLeft: () => (
            <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-full mr-2">
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <CardTitle>Pricing Request</CardTitle>
                <Badge variant={record.status === "Rejected" ? "destructive" : "secondary"}>{record.status || "—"}</Badge>
              </View>
            </CardHeader>
            <CardContent className="gap-0">
              <InfoRow label="Request ID" value={record.id} />
              <InfoRow label="Provider" value={getProviderName(record)} />
              <InfoRow label="Container Type" value={record.containerType} />
              <InfoRow label="Delay Type" value={record.delayType} />
              {record.reason ? <InfoRow label="Reason" value={record.reason} /> : null}
              <InfoRow label="Created" value={formatDate(record.created)} />
              <InfoRow label="Updated" value={formatDate(record.updated)} />
            </CardContent>
          </Card>

          {(twentyft?.clicked || fortyft?.clicked) && (
            <Card>
              <CardHeader>
                <CardTitle>Container details</CardTitle>
              </CardHeader>
              <CardContent className="gap-3">
                {twentyft?.clicked && (
                  <View className="gap-1">
                    <Text className="font-medium">20ft</Text>
                    <Text className="text-sm text-muted-foreground">Preferable rate: {twentyft.preferableRate || "—"}</Text>
                    <Text className="text-sm text-muted-foreground">Containers per month: {twentyft.containersPerMonth ?? twentyft.containerPerMonths ?? "—"}</Text>
                    <Text className="text-sm text-muted-foreground">Free ground rent days: {twentyft.freeGroundRentDays ?? twentyft.groundrentFreeDays ?? "—"}</Text>
                  </View>
                )}
                {fortyft?.clicked && (
                  <View className="gap-1">
                    <Text className="font-medium">40ft</Text>
                    <Text className="text-sm text-muted-foreground">Preferable rate: {fortyft.preferableRate || "—"}</Text>
                    <Text className="text-sm text-muted-foreground">Containers per month: {fortyft.containersPerMonth ?? fortyft.containerPerMonths ?? "—"}</Text>
                    <Text className="text-sm text-muted-foreground">Free ground rent days: {fortyft.freeGroundRentDays ?? fortyft.groundrentFreeDays ?? "—"}</Text>
                  </View>
                )}
              </CardContent>
            </Card>
          )}
        </View>
      </ScrollView>
    </>
  );
}
