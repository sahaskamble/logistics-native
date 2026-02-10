import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { ArrowLeft, Edit } from "lucide-react-native";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import RequestStats, { type RequestStatus } from "@/components/cfs/RequestStats";
import LoadingView from "@/components/LoadingView";

import { listCfsPricingRequests } from "@/lib/actions/cfs/pricingRequest";
import type { CfsPricingRequestRecord } from "@/lib/actions/cfs/pricingRequest";

const BASE_PATH = "/(protected)/cfs/pricing-request";

function getStatusConfig(status?: RequestStatus) {
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

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-US", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return "";
  }
}

function getProviderName(r: CfsPricingRequestRecord): string {
  const expanded = (r as any).expand?.serviceProvider;
  if (expanded?.title) return expanded.title;
  return r.serviceProvider ? `Provider ${String(r.serviceProvider).slice(0, 8)}` : "—";
}

export default function CfsPricingRequestListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<CfsPricingRequestRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listCfsPricingRequests({ expand: "serviceProvider", sort: "-created" });
    if (!res.success) {
      Alert.alert("Error", res.message);
      setRequests([]);
    } else {
      setRequests(res.output || []);
    }
    setLoading(false);
  }, []);

  const filteredRequests = useMemo(() => {
    let list = requests;
    if (selectedStatus !== "All") list = list.filter((r) => r.status === selectedStatus);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => {
      const provider = getProviderName(r).toLowerCase();
      const id = (r.id || "").toString().toLowerCase();
      const container = (r.containerType || "").toLowerCase();
      const delay = (r.delayType || "").toLowerCase();
      return id.includes(q) || provider.includes(q) || container.includes(q) || delay.includes(q);
    });
  }, [requests, searchQuery, selectedStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  if (loading) {
    return <LoadingView LoadingText="Loading pricing requests..." />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Pricing Request",
          headerRight: () => (
            <Button variant="default" onPress={() => router.push(`${BASE_PATH}/create` as any)}>
              <Text>New Request</Text>
            </Button>
          ),
          headerLeft: () => (
            <Button variant="ghost" size="icon" onPress={() => router.replace("/(protected)/home")} className="rounded-full mr-2">
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />

      <ScrollView className="flex-1 bg-background pb-4" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <RequestStats
          serviceTitle="Pricing"
          requests={requests}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        <View className="px-4 pb-6 gap-4">
          <View>
            <Text className="text-xl font-bold">My Requests</Text>
            <View className="py-2">
              <Input
                placeholder="Search by provider, ID, container or delay type"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
            </View>
          </View>

          {filteredRequests.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-muted-foreground">No pricing requests found.</Text>
            </View>
          ) : (
            filteredRequests.map((r) => {
              const createdLabel = formatDate(r.created);
              const statusConfig = getStatusConfig(r.status as RequestStatus);

              const renderRightActions = () => (
                <View className="flex-row h-full rounded-xl overflow-hidden">
                  <Pressable
                    className="justify-center items-center px-6"
                    onPress={() => router.push(`${BASE_PATH}/edit/${r.id}` as any)}
                  >
                    <Icon as={Edit} className="size-6 text-blue-500" />
                    <Text className="text-blue-500 text-sm mt-1">Edit</Text>
                  </Pressable>
                </View>
              );

              return (
                <Swipeable key={r.id} renderRightActions={renderRightActions} overshootRight={false}>
                  <Pressable onPress={() => router.push(`${BASE_PATH}/view/${r.id}` as any)}>
                    <Card>
                      <CardHeader>
                        <View className="flex-row items-center justify-between">
                          <CardTitle>Request: {r.id}</CardTitle>
                          <Badge variant={statusConfig.variant} className={statusConfig.bgColor}>
                            <Text className="text-xs text-white">{r.status || "Unknown"}</Text>
                          </Badge>
                        </View>
                      </CardHeader>
                      <CardContent className="gap-1">
                        <Text className="text-sm">Provider: {getProviderName(r)}</Text>
                        {r.containerType && <Text className="text-sm">Container: {r.containerType}</Text>}
                        {r.delayType && <Text className="text-sm">Delay: {r.delayType}</Text>}
                        {createdLabel && <Text className="text-sm">Created: {createdLabel}</Text>}
                      </CardContent>
                    </Card>
                  </Pressable>
                </Swipeable>
              );
            })
          )}
        </View>
      </ScrollView>
    </>
  );
}
