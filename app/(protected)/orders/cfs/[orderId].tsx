import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

import { getCfsOrderById, type CfsOrderDocument, type CfsOrderRecord } from "@/lib/actions/cfs/fetch";

function formatDateTime(created?: string) {
  if (!created) return "";
  try {
    return new Date(created).toLocaleString();
  } catch {
    return created;
  }
}

function formatIsoDateTime(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function getStatusBadgeVariant(status?: CfsOrderRecord["status"]) {
  switch (status) {
    case "Pending":
      return "default";
    case "In Progress":
      return "secondary";
    case "Rejected":
      return "destructive";
    case "Completed":
      return "outline";
    case "Accepted":
      return "secondary";
    default:
      return "outline";
  }
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export default function CfsOrderDetailsPage() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  console.log("Order ID", orderId);

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [order, setOrder] = useState<CfsOrderRecord | null>(null);
  const [documents, setDocuments] = useState<CfsOrderDocument[]>([]);
  const [authHeader, setAuthHeader] = useState<string>("");

  const headerTitle = useMemo(() => {
    if (!order) return "Order Details";
    return order.orderDescription || order.blNo || `Order #${order.id.slice(0, 8)}`;
  }, [order]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        const id = (orderId || "").toString();
        const res = await getCfsOrderById(id);
        if (!mounted) return;

        if (!res.success || !res.output) {
          Alert.alert("Error", res.message || "Failed to fetch order.");
          setOrder(null);
          setDocuments([]);
          setAuthHeader("");
          return;
        }

        setOrder(res.output.order);
        setDocuments(res.output.documents);
        setAuthHeader(res.output.authHeader);
      } catch (err: any) {
        if (!mounted) return;
        Alert.alert("Error", err?.message || "Failed to fetch order.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const downloadOne = async (doc: CfsOrderDocument) => {
    try {
      if (downloading) return;
      setDownloading(true);

      const dir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      if (!dir) {
        Alert.alert("Error", "No writable directory available.");
        return;
      }

      const filePath = `${dir}${safeFileName(doc.name)}`;

      const headers: Record<string, string> = {};
      if (authHeader) headers.Authorization = authHeader;

      await FileSystem.downloadAsync(doc.url, filePath, { headers });
      Alert.alert("Downloaded", `Saved to: ${filePath}`);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to download file.");
    } finally {
      setDownloading(false);
    }
  };

  const downloadAll = async () => {
    if (documents.length === 0) {
      Alert.alert("No documents", "This order has no attached documents.");
      return;
    }

    Alert.alert("Download all documents", `Download ${documents.length} file(s) one by one?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Download",
        onPress: async () => {
          try {
            if (downloading) return;
            setDownloading(true);

            const dir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
            if (!dir) {
              Alert.alert("Error", "No writable directory available.");
              return;
            }

            const headers: Record<string, string> = {};
            if (authHeader) headers.Authorization = authHeader;

            for (const doc of documents) {
              const filePath = `${dir}${safeFileName(doc.name)}`;
              await FileSystem.downloadAsync(doc.url, filePath, { headers });
            }

            Alert.alert("Success", `Downloaded ${documents.length} file(s).`);
          } catch (err: any) {
            Alert.alert("Error", err?.message || "Failed to download documents.");
          } finally {
            setDownloading(false);
          }
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: headerTitle }} />

      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          {loading ? (
            <View className="items-center justify-center py-10">
              <ActivityIndicator />
              <Text className="mt-2 text-muted-foreground">Loading order...</Text>
            </View>
          ) : !order ? (
            <Card>
              <CardHeader>
                <CardTitle>Order not found</CardTitle>
              </CardHeader>
              <CardContent>
                <Text className="text-muted-foreground">Unable to load this order.</Text>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <View className="flex-row items-center justify-between">
                    <CardTitle>Order</CardTitle>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      <Text className="text-xs">{order.status || "Unknown"}</Text>
                    </Badge>
                  </View>
                </CardHeader>
                <CardContent className="gap-2">
                  <Text className="text-xs text-muted-foreground">Created: {formatDateTime(order.created)}</Text>

                  {order.igmNo ? <Text>IGM No: {order.igmNo}</Text> : null}
                  {order.blNo ? <Text>BL No: {order.blNo}</Text> : null}
                  {order.itemNo ? <Text>Item No: {order.itemNo}</Text> : null}
                  {order.shipping_line ? <Text>Shipping line: {order.shipping_line}</Text> : null}
                  {order.eta ? <Text>ETA: {formatIsoDateTime(order.eta)}</Text> : null}
                  {order.dpdType ? <Text>DPD type: {order.dpdType}</Text> : null}
                  {order.deliveryType ? <Text>Delivery type: {order.deliveryType}</Text> : null}
                  {order.consigneeName ? <Text>Consignee: {order.consigneeName}</Text> : null}
                  {order.chaName ? <Text>CHA: {order.chaName}</Text> : null}

                  {order.orderDescription ? (
                    <View className="pt-2">
                      <Text className="font-semibold">Description</Text>
                      <Text className="text-muted-foreground">{order.orderDescription}</Text>
                    </View>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <View className="flex-row items-center justify-between">
                    <CardTitle>Documents</CardTitle>
                    <Button variant="outline" disabled={downloading} onPress={downloadAll}>
                      {downloading ? <ActivityIndicator /> : <Text>Download all documents</Text>}
                    </Button>
                  </View>
                </CardHeader>
                <CardContent className="gap-2">
                  {documents.length === 0 ? (
                    <Text className="text-muted-foreground">No documents attached.</Text>
                  ) : (
                    documents.map((doc) => (
                      <Pressable key={`${doc.field}:${doc.name}`} onPress={() => downloadOne(doc)}>
                        <View className="flex-row items-center justify-between p-3 border border-border rounded-lg">
                          <View className="flex-1 pr-3">
                            <Text className="font-medium" numberOfLines={1}>
                              {doc.name}
                            </Text>
                            <Text className="text-xs text-muted-foreground">{doc.field}</Text>
                          </View>
                          <Text className="text-primary">Download</Text>
                        </View>
                      </Pressable>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}
