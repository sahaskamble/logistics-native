
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from "@/components/ui/select";
import LoadingView from "@/components/LoadingView";

import { listCfsOrdersForCurrentUser } from "@/lib/actions/cfs/fetch";
import { createEirCopyRequest } from "@/lib/actions/cfs/eirCopy";
import { Textarea } from "@/components/ui/textarea";

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

type PickedFile = { uri: string; name: string; type: string };

export default function CreateEirCopyRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [orders, setOrders] = useState<CfsOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [customerRemarks, setCustomerRemarks] = useState<string>("");
  const [files, setFiles] = useState<PickedFile[]>([]);

  const orderOptions: Option[] = useMemo(() => {
    return orders.map((o) => ({ value: o.id, label: getOrderLabel(o) }));
  }, [orders]);

  const selectedOrderOption = useMemo(() => {
    return orderOptions.find((o) => (o?.value || "") === selectedOrderId);
  }, [orderOptions, selectedOrderId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await listCfsOrdersForCurrentUser({ sort: "-created" });
      if (!res.success) {
        Alert.alert("Error", res.message);
        setOrders([]);
        setSelectedOrderId("");
      } else {
        setOrders(res.output);
        setSelectedOrderId((prev) => prev || res.output[0]?.id || "");
      }
      setLoading(false);
    };
    load();
  }, []);

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
      const res = await createEirCopyRequest({
        orderId: selectedOrderId,
        customerRemarks,
        files,
      });

      if (!res.success) {
        Alert.alert("Error", res.message);
        return;
      }

      Alert.alert("Success", res.message);
      router.replace("/(protected)/cfs/eir-copy");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingView LoadingText="Loading orders..." />;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Create EIR Copy" }} />

      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>New EIR Copy Request</CardTitle>
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
                <Textarea
                  value={customerRemarks}
                  onChangeText={setCustomerRemarks}
                  placeholder="Add remarks (optional)"
                  className="max-w-full"
                />
              </View>

              <View className="gap-2">
                <Label>Attachments (optional)</Label>
                <Button variant="outline" onPress={pickFiles}>
                  <Text>{files.length > 0 ? `${files.length} file(s) selected` : "Pick files"}</Text>
                </Button>
                {files.length > 0 && (
                  <Text className="text-xs text-muted-foreground">Files will be uploaded with the request.</Text>
                )}
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
