import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteEirCopyRequest, listEirCopyRequests, type CfsServiceRequestRecord } from "@/lib/actions/cfs/eirCopy";
import LoadingView from "@/components/LoadingView";
import RequestStats, { type RequestStatus } from "@/components/cfs/RequestStats";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { ArrowLeft, Edit, Trash2 } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

function getStatusConfig(status?: RequestStatus) {
  switch (status) {
    case 'Pending':
      return { variant: 'default' as const, bgColor: 'bg-yellow-500' };
    case 'Accepted':
      return { variant: 'secondary' as const, bgColor: 'bg-green-500' };
    case 'In Progress':
      return { variant: 'secondary' as const, bgColor: 'bg-gray-400' };
    case 'Rejected':
      return { variant: 'destructive' as const, bgColor: 'bg-red-500' };
    case 'Completed':
      return { variant: 'outline' as const, bgColor: 'bg-blue-500' };
    default:
      return { variant: 'outline' as const, bgColor: 'bg-muted-background' };
  }
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function EirCopyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");
  const [requests, setRequests] = useState<CfsServiceRequestRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listEirCopyRequests({ expand: "order,serviceType", sort: "-created" });
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

    if (selectedStatus !== "All") {
      list = list.filter((r) => r.status === selectedStatus);
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter((r) => {
      const orderId = ((r as any).expand?.order?.id || r.order || "").toString().toLowerCase();
      const remarks = (r.customerRemarks || "").toString().toLowerCase();
      const id = (r.id || "").toString().toLowerCase();
      return id.includes(q) || orderId.includes(q) || remarks.includes(q);
    });
  }, [requests, searchQuery, selectedStatus]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

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
    return (
      <LoadingView LoadingText="Loading Eir-Copy..." />
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "EIR Copy",
          headerRight: () => (
            <Button variant="default" onPress={() => router.push("/(protected)/cfs/eir-copy/create")}>
              <Text>New Request</Text>
            </Button>
          ),
          headerLeft: () => (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.replace('/(protected)/home')}
              className="rounded-full mr-2"
            >
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />
      <ScrollView
        className="flex-1 bg-background"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <RequestStats
          serviceTitle="Eir Copy Requests"
          requests={requests}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        <View className="px-4 gap-4 pb-6">
          <View>
            <Text className="text-xl font-bold">My Requests</Text>
            <View className="py-2">
              <Input
                placeholder="Search Request / Order / Remarks"
                value={searchQuery}
                onChangeText={handleSearchChange}
                clearButtonMode="while-editing"
              />
            </View>
          </View>

          {filteredRequests.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-muted-foreground">No EIR Copy requests found.</Text>
            </View>
          ) : (
            filteredRequests.map((r) => {
              const orderId = (r as any).expand?.order?.id || r.order || "";
              const createdLabel = formatDate(r.created);

              const renderRightActions = () => (
                <View className="flex-row h-full rounded-xl overflow-hidden">
                  <Pressable
                    className="justify-center items-center px-6"
                    onPress={() => router.push(`/(protected)/cfs/eir-copy/edit/${r.id}`)}
                  >
                    <Icon as={Edit} className="size-6 text-blue-500" />
                    <Text className="text-blue-500 text-sm mt-1">Edit</Text>
                  </Pressable>
                  <Pressable
                    className="justify-center items-center px-6"
                    onPress={() => {
                      if (deletingId) return;
                      Alert.alert(
                        "Delete request?",
                        "This will permanently delete this request.",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: async () => {
                              try {
                                setDeletingId(r.id);
                                const res = await deleteEirCopyRequest(r.id);
                                if (!res.success) {
                                  Alert.alert("Error", res.message);
                                  return;
                                }
                                await load();
                                Alert.alert("Success", res.message);
                              } catch (err: any) {
                                Alert.alert("Error", err?.message || "Failed to delete request.");
                              } finally {
                                setDeletingId("");
                              }
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Icon as={Trash2} className="size-6 text-red-500" />
                    <Text className="text-red-500 text-sm mt-1">Delete</Text>
                  </Pressable>
                </View>
              );

              return (
                <Swipeable key={r.id} renderRightActions={renderRightActions} overshootRight={false}>
                  <Pressable onPress={() => router.push(`/(protected)/cfs/eir-copy/view/${r.id}`)}>
                    <Card>
                      <CardHeader>
                        <View className="flex-row items-center justify-between">
                          <CardTitle>Request ID: {r.id}</CardTitle>
                          <Badge variant={getStatusConfig(r.status).variant} className={getStatusConfig(r.status).bgColor}>
                            <Text className="text-xs text-white">{r.status || "Unknown"}</Text>
                          </Badge>
                        </View>
                      </CardHeader>
                      <CardContent className="gap-1">
                        {!!orderId && <Text className="text-sm">Order: {orderId}</Text>}
                        {!!createdLabel && <Text className="text-sm">Created: {createdLabel}</Text>}
                        {!!r.customerRemarks && (
                          <Text className="text-sm text-muted-foreground" numberOfLines={4}>
                            {r.customerRemarks}
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
    </>
  );
}
