import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { ArrowLeft, Edit, Trash2 } from "lucide-react-native";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import LoadingView from "@/components/LoadingView";
import RequestStats, { type RequestStatus } from "@/components/cfs/RequestStats";

import { listCfsOrdersForCurrentUser } from "@/lib/actions/cfs/fetch";
import type { CfsServiceRequestRecord, PickedFile, ServiceRequestDocument } from "@/lib/actions/cfs/genericServiceRequest";

type CfsOrder = {
  id: string;
  orderDescription?: string;
  blNo?: string;
  igmNo?: string;
};

type DefinedOption = Option & { value: string; label: string };

function isDefinedOption(opt?: Option): opt is DefinedOption {
  return !!opt && typeof opt.value === "string" && !!opt.value && typeof opt.label === "string" && !!opt.label;
}

function getOrderLabel(order: CfsOrder) {
  return order.orderDescription || order.blNo || order.igmNo || `Order #${order.id.slice(0, 8)}`;
}

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
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "";
  }
}

function getStatusVariant(status?: string) {
  switch (status) {
    case "Pending":
      return "default" as const;
    case "Accepted":
    case "In Progress":
      return "secondary" as const;
    case "Rejected":
      return "destructive" as const;
    case "Completed":
      return "outline" as const;
    default:
      return "outline" as const;
  }
}

function isImageFile(filename?: string) {
  if (!filename) return false;
  const lower = filename.toLowerCase();
  return [".jpg", ".jpeg", ".png", ".gif", ".webp"].some((ext) => lower.endsWith(ext));
}

export type ServiceRequestListScreenProps = {
  title: string;
  basePath: string;
  listRequests: (options?: any) => Promise<{ success: boolean; message: string; output: CfsServiceRequestRecord[] }>;
  deleteRequest?: (requestId: string) => Promise<{ success: boolean; message: string }>;
};

export function ServiceRequestListScreen({
  title,
  basePath,
  listRequests,
  deleteRequest,
}: ServiceRequestListScreenProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");
  const [requests, setRequests] = useState<CfsServiceRequestRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listRequests({ expand: "order,serviceType", sort: "-created" });
    if (!res.success) {
      Alert.alert("Error", res.message);
      setRequests([]);
    } else {
      setRequests(res.output || []);
    }
    setLoading(false);
  }, [listRequests]);

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
    return <LoadingView LoadingText={`Loading ${title}...`} />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: title,
          headerRight: () => (
            <Button variant="default" onPress={() => router.push(`${basePath}/create` as any)}>
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
        className="flex-1 bg-background pb-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <RequestStats
          serviceTitle={`${title} Requests`}
          requests={requests}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        <View className="px-4 pb-6 gap-4">
          <View>
            <Text className="text-xl font-bold">My Requests</Text>
            <View className="py-2">
              <Input
                placeholder="Search Request / Order / Remarks"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
            </View>
          </View>

          {filteredRequests.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-muted-foreground">No {title} requests found.</Text>
            </View>
          ) : (
            filteredRequests.map((r) => {
              const orderId = (r as any).expand?.order?.id || r.order || "";
              const createdLabel = formatDate(r.created);

              const renderRightActions = () => (
                <View className="flex-row h-full rounded-xl overflow-hidden">
                  <Pressable
                    className="justify-center items-center px-6"
                    onPress={() => router.push(`${basePath}/edit/${r.id}` as any)}
                  >
                    <Icon as={Edit} className="size-6 text-blue-500" />
                    <Text className="text-blue-500 text-sm mt-1">Edit</Text>
                  </Pressable>
                  {!!deleteRequest && (
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
                                  const res = await deleteRequest(r.id);
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
                  )}
                </View>
              );

              return (
                <Swipeable key={r.id} renderRightActions={renderRightActions} overshootRight={false}>
                  <Pressable onPress={() => router.push(`${basePath}/view/${r.id}` as any)}>
                    <Card>
                      <CardHeader>
                        <View className="flex-row items-center justify-between">
                          <CardTitle>Request ID: {r.id}</CardTitle>
                          <Badge variant={getStatusConfig(r.status as any).variant} className={getStatusConfig(r.status as any).bgColor}>
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

export type ServiceRequestCreateScreenProps = {
  title: string;
  basePath: string;
  createRequest: (params: { orderId: string; customerRemarks?: string; files?: PickedFile[] | null }) => Promise<{ success: boolean; message: string }>;
  /** Optional: use this to load orders for the dropdown (e.g. warehouse). Defaults to CFS orders. */
  listOrders?: () => Promise<{ success: boolean; message?: string; output: CfsOrder[] }>;
};

export function ServiceRequestCreateScreen({
  title,
  basePath,
  createRequest,
  listOrders: listOrdersProp,
}: ServiceRequestCreateScreenProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [orders, setOrders] = useState<CfsOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [customerRemarks, setCustomerRemarks] = useState<string>("");
  const [files, setFiles] = useState<PickedFile[]>([]);

  const listOrders = listOrdersProp ?? (() => listCfsOrdersForCurrentUser({ sort: "-created" }));

  const orderOptions: Option[] = useMemo(() => orders.map((o) => ({ value: o.id, label: getOrderLabel(o) })), [orders]);

  const selectedOrderOption = useMemo(() => orderOptions.find((o) => (o?.value || "") === selectedOrderId), [orderOptions, selectedOrderId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await listOrders();
      if (!res.success) {
        Alert.alert("Error", res.message || "Failed to load orders");
        setOrders([]);
        setSelectedOrderId("");
      } else {
        setOrders(res.output || []);
        setSelectedOrderId((prev) => prev || (res.output || [])[0]?.id || "");
      }
      setLoading(false);
    };
    load();
  }, [listOrders]);

  const pickFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;
      const assets = res.assets || [];
      const mapped: PickedFile[] = assets
        .filter((a) => !!a?.uri)
        .map((a) => ({
          uri: a.uri,
          name: a.name || "file",
          type: (a.mimeType || "application/octet-stream") as string,
        }));
      setFiles(mapped);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to pick files.");
    }
  };

  const submit = async () => {
    if (!selectedOrderId) {
      Alert.alert("Error", "Please select an order.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createRequest({
        orderId: selectedOrderId,
        customerRemarks,
        files,
      });

      if (!res.success) {
        Alert.alert("Error", res.message);
        return;
      }

      Alert.alert("Success", res.message);
      router.replace(basePath as any);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingView LoadingText="Loading orders..." />;
  }

  return (
    <>
      <Stack.Screen options={{ title: `Create ${title}` }} />

      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>New {title} Request</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="gap-2">
                <Label>Order *</Label>
                <Select
                  value={selectedOrderOption}
                  onValueChange={(opt?: Option) => {
                    if (!opt) return;
                    setSelectedOrderId(opt.value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderOptions
                      .filter(isDefinedOption)
                      .map((o) => (
                        <SelectItem key={o.value} value={o.value} label={o.label}>
                          {o.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </View>

              <View className="gap-2">
                <Label>Customer Remarks</Label>
                <Textarea value={customerRemarks} onChangeText={setCustomerRemarks} placeholder="Add remarks (optional)" className="max-w-full" />
              </View>

              <View className="gap-2">
                <Label>Attachments (optional)</Label>
                <Button variant="outline" onPress={pickFiles}>
                  <Text>{files.length > 0 ? `${files.length} file(s) selected` : "Pick files"}</Text>
                </Button>
                {files.length > 0 && <Text className="text-xs text-muted-foreground">Files will be uploaded with the request.</Text>}
              </View>

              <Button className="w-full" onPress={submit} disabled={submitting}>
                {submitting ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="white" />
                    <Text>Submitting...</Text>
                  </View>
                ) : (
                  <Text>Submit Request</Text>
                )}
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </>
  );
}

export function ServiceRequestViewScreen({
  title,
  basePath,
  getRequestById,
}: {
  title: string;
  basePath: string;
  getRequestById: (requestId: string, options?: any) => Promise<{
    success: boolean;
    message: string;
    output: { request: CfsServiceRequestRecord; documents: ServiceRequestDocument[]; authHeader: string } | null;
  }>;
}) {
  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId: string }>();

  const [loading, setLoading] = useState(true);
  const [req, setReq] = useState<CfsServiceRequestRecord | null>(null);
  const [documents, setDocuments] = useState<ServiceRequestDocument[]>([]);
  const [authHeader, setAuthHeader] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      if (!recordId) return;
      setLoading(true);
      const res = await getRequestById(recordId, { expand: "order,serviceType" });
      if (!res.success || !res.output) {
        Alert.alert("Error", res.message || "Failed to load request");
        setReq(null);
        setDocuments([]);
        setAuthHeader("");
      } else {
        setReq(res.output.request);
        setDocuments(res.output.documents);
        setAuthHeader(res.output.authHeader);
      }
      setLoading(false);
    };
    load();
  }, [getRequestById, recordId]);

  const imageDocs = useMemo(() => documents.filter((d) => isImageFile(d.name)), [documents]);
  const otherDocs = useMemo(() => documents.filter((d) => !isImageFile(d.name)), [documents]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-muted-foreground">Loading request...</Text>
      </View>
    );
  }

  if (!req) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Request not found</Text>
      </View>
    );
  }

  const serviceTypeTitle = (req as any)?.expand?.serviceType?.title || title;
  const orderId = (req as any)?.expand?.order?.id || req.order || "";

  return (
    <>
      <Stack.Screen
        options={{
          title: `Request #${req.id}`,
          headerRight: () => (
            <Button variant="outline" onPress={() => router.push(`${basePath}/edit/${req.id}` as any)}>
              <Text>Edit</Text>
            </Button>
          ),
          headerLeft: () => (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.back()}
              className="rounded-full mr-2"
            >
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
                <CardTitle>{serviceTypeTitle}</CardTitle>
                <Badge variant={getStatusVariant(req.status)}>
                  <Text>{req.status || "Unknown"}</Text>
                </Badge>
              </View>
            </CardHeader>
            <CardContent className="gap-3">
              <InfoRow label="Request ID" value={req.id} />
              <InfoRow label="Order" value={orderId} />
              <InfoRow label="Customer Remarks" value={req.customerRemarks || "-"} />
              {!!req.reason && <InfoRow label="Reason" value={req.reason} />}
            </CardContent>
          </Card>

          {(imageDocs.length > 0 || otherDocs.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Attachments ({documents.length})</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                {imageDocs.length > 0 && (
                  <View className="gap-2">
                    <Text className="font-medium">Images</Text>
                    {imageDocs.map((doc) => (
                      <View key={doc.url} className="rounded-lg overflow-hidden border border-border">
                        <Image
                          source={{ uri: doc.url, headers: authHeader ? { Authorization: authHeader } : undefined }}
                          style={{ width: "100%", height: 180 }}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </View>
                )}

                {otherDocs.length > 0 && (
                  <View className="gap-2">
                    <Text className="font-medium">Files</Text>
                    {otherDocs.map((doc) => (
                      <Pressable key={doc.url} className="py-3 px-4 bg-muted/50 rounded-lg" onPress={() => Alert.alert("File", doc.name)}>
                        <Text className="font-medium">{doc.name}</Text>
                      </Pressable>
                    ))}
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

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <>
      <View className="gap-1">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        <Text className="text-base">{value || "-"}</Text>
      </View>
      <Separator className="my-2" />
    </>
  );
}

export function ServiceRequestEditScreen({
  title,
  basePath,
  getRequestById,
  updateRequest,
}: {
  title: string;
  basePath: string;
  getRequestById: (requestId: string, options?: any) => Promise<any>;
  updateRequest: (params: { requestId: string; customerRemarks?: string; addFiles?: PickedFile[] | null }) => Promise<{ success: boolean; message: string }>;
}) {
  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [req, setReq] = useState<CfsServiceRequestRecord | null>(null);
  const [customerRemarks, setCustomerRemarks] = useState<string>("");
  const [addFiles, setAddFiles] = useState<PickedFile[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!recordId) return;
      setLoading(true);
      const res = await getRequestById(recordId, { expand: "order,serviceType" });
      if (!res.success || !res.output) {
        Alert.alert("Error", res.message || "Failed to load request");
        setReq(null);
        setCustomerRemarks("");
      } else {
        const request = res.output.request || res.output;
        setReq(request);
        setCustomerRemarks(request.customerRemarks || "");
      }
      setLoading(false);
    };
    load();
  }, [getRequestById, recordId]);

  const existingFilesCount = useMemo(() => {
    const files = (req as any)?.files;
    return Array.isArray(files) ? files.length : 0;
  }, [req]);

  const pickFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;
      const assets = res.assets || [];
      const mapped: PickedFile[] = assets
        .filter((a) => !!a?.uri)
        .map((a) => ({
          uri: a.uri,
          name: a.name || "file",
          type: (a.mimeType || "application/octet-stream") as string,
        }));
      setAddFiles(mapped);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to pick files.");
    }
  };

  const save = async () => {
    if (!recordId) return;

    setSaving(true);
    try {
      const res = await updateRequest({
        requestId: recordId,
        customerRemarks,
        addFiles,
      });

      if (!res.success) {
        Alert.alert("Error", res.message);
        return;
      }

      Alert.alert("Success", res.message);
      router.replace(`${basePath}/view/${recordId}` as any);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingView LoadingText="Loading request..." />;
  }

  if (!req) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Request not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `Edit #${req.id}` }} />

      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit {title} Request</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Customer Remarks</Text>
                <Input
                  value={customerRemarks}
                  onChangeText={setCustomerRemarks}
                  placeholder="Add remarks (optional)"
                  multiline
                  numberOfLines={4}
                  className="min-h-24"
                />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Existing attachments</Text>
                <Text>{existingFilesCount > 0 ? `${existingFilesCount} file(s)` : "-"}</Text>
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Add more attachments</Text>
                <Button variant="outline" onPress={pickFiles}>
                  <Text>{addFiles.length > 0 ? `${addFiles.length} file(s) selected` : "Pick files"}</Text>
                </Button>
              </View>

              <Button className="w-full" onPress={save} disabled={saving}>
                {saving ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="white" />
                    <Text>Saving...</Text>
                  </View>
                ) : (
                  <Text>Save Changes</Text>
                )}
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </>
  );
}
