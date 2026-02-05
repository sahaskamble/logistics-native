import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { X } from "lucide-react-native";

import {
  createCfsOrder,
  listContainersForCurrentUser,
  listVerifiedCfsProviders,
  type CfsProvider,
  type UserContainer,
} from "@/lib/actions/cfs/createOrder";
import LoadingView from "@/components/LoadingView";

type PickedFile = { uri: string; name: string; type: string };

function formatDateTime(d?: Date | null) {
  if (!d) return "";
  try {
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(d);
  }
}

export default function CreateOrderPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [providers, setProviders] = useState<CfsProvider[]>([]);
  const [containers, setContainers] = useState<UserContainer[]>([]);

  const [providerPickerOpen, setProviderPickerOpen] = useState(false);
  const [containerPickerOpen, setContainerPickerOpen] = useState(false);

  const [providerSearch, setProviderSearch] = useState("");
  const [containerSearch, setContainerSearch] = useState("");

  const [igmNo, setIgmNo] = useState("");
  const [blNo, setBlNo] = useState("");
  const [itemNo, setItemNo] = useState("");
  const [consigneeName, setConsigneeName] = useState("");
  const [chaName, setChaName] = useState("");
  const [orderDescription, setOrderDescription] = useState("");
  const [shippingLine, setShippingLine] = useState("");
  const [eta, setEta] = useState<Date | null>(null);
  const [showEtaPicker, setShowEtaPicker] = useState(false);

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedContainerIds, setSelectedContainerIds] = useState<string[]>([]);

  const [deliveryType, setDeliveryType] = useState<"Loaded" | "Destuffed" | null>(null);
  const [dpdType, setDpdType] = useState<"DPD" | "Non-DPD" | null>(null);

  const [files, setFiles] = useState<PickedFile[]>([]);
  const [confirmShippingLine, setConfirmShippingLine] = useState<PickedFile | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          listVerifiedCfsProviders({ sort: "title" }),
          listContainersForCurrentUser({ sort: "-created" }),
        ]);

        if (!mounted) return;

        if (!pRes.success) {
          Alert.alert("Error", pRes.message);
        } else {
          setProviders(pRes.output || []);
        }

        if (!cRes.success) {
          Alert.alert("Error", cRes.message);
        } else {
          setContainers(cRes.output || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedProvider = useMemo(
    () => providers.find((p) => p.id === selectedProviderId) || null,
    [providers, selectedProviderId]
  );

  const selectedContainerRecords = useMemo(() => {
    const set = new Set(selectedContainerIds);
    return containers.filter((c) => set.has(c.id));
  }, [containers, selectedContainerIds]);

  const filteredProviders = useMemo(() => {
    const q = providerSearch.trim().toLowerCase();
    if (!q) return providers;
    return providers.filter((p) => (p.title || "").toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  }, [providers, providerSearch]);

  const filteredContainers = useMemo(() => {
    const q = containerSearch.trim().toLowerCase();
    if (!q) return containers;
    return containers.filter(
      (c) => (c.containerNo || "").toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [containers, containerSearch]);

  const toggleContainer = (id: string) => {
    setSelectedContainerIds((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return Array.from(set);
    });
  };

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

  const pickConfirmShippingLine = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (res.canceled) return;

      const a = res.assets?.[0];
      if (!a?.uri) return;

      setConfirmShippingLine({
        uri: a.uri,
        name: a.name || "confirmShippingLine",
        type: (a.mimeType || "application/octet-stream") as string,
      });
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to pick document.");
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);

      const res = await createCfsOrder({
        igmNo,
        blNo,
        itemNo,
        consigneeName,
        chaName,
        cfs: selectedProviderId || undefined,
        shipping_line: shippingLine,
        dpdType: dpdType || undefined,
        eta: eta || undefined,
        deliveryType: (deliveryType as any) || undefined,
        orderDescription,
        containers: selectedContainerIds,
        files,
        confirmShippingLine,
      });

      if (!res.success) {
        Alert.alert("Error", res.message);
        return;
      }

      Alert.alert("Success", res.message);
      router.replace("/(protected)/cfs/order");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEtaChange = (event: any, selectedDate?: Date) => {
    if (event?.type === "dismissed") {
      setTimeout(() => setShowEtaPicker(false), 0);
      return;
    }

    if (selectedDate) {
      setEta(selectedDate);
    }

    setTimeout(() => setShowEtaPicker(false), 0);
  };

  if (loading) {
    return (
      <LoadingView LoadingText="Loading..." />
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Create new order" }} />

      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Create CFS Order</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">IGM No</Text>
                <Input value={igmNo} onChangeText={setIgmNo} placeholder="Enter IGM No" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">BL No</Text>
                <Input value={blNo} onChangeText={setBlNo} placeholder="Enter BL No" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Item No</Text>
                <Input value={itemNo} onChangeText={setItemNo} placeholder="Enter Item No" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Consignee Name</Text>
                <Input value={consigneeName} onChangeText={setConsigneeName} placeholder="Enter Consignee" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">CHA Name</Text>
                <Input value={chaName} onChangeText={setChaName} placeholder="Enter CHA" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Shipping Line</Text>
                <Input value={shippingLine} onChangeText={setShippingLine} placeholder="Enter shipping line" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">CFS Provider</Text>
                <Button variant="outline" onPress={() => setProviderPickerOpen(true)}>
                  <Text>{selectedProvider?.title || "Select CFS provider"}</Text>
                </Button>
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Delivery Type</Text>
                <View className="flex-row gap-2">
                  <Button
                    variant={deliveryType === "Loaded" ? "default" : "outline"}
                    className="flex-1"
                    onPress={() => setDeliveryType("Loaded")}
                  >
                    <Text>Loaded</Text>
                  </Button>
                  <Button
                    variant={deliveryType === "Destuffed" ? "default" : "outline"}
                    className="flex-1"
                    onPress={() => setDeliveryType("Destuffed")}
                  >
                    <Text>Destuffed</Text>
                  </Button>
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">DPD Type</Text>
                <View className="flex-row gap-2">
                  <Button
                    variant={dpdType === "DPD" ? "default" : "outline"}
                    className="flex-1"
                    onPress={() => setDpdType("DPD")}
                  >
                    <Text>DPD</Text>
                  </Button>
                  <Button
                    variant={dpdType === "Non-DPD" ? "default" : "outline"}
                    className="flex-1"
                    onPress={() => setDpdType("Non-DPD")}
                  >
                    <Text>Non-DPD</Text>
                  </Button>
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">ETA</Text>
                <Button variant="outline" onPress={() => setShowEtaPicker(true)}>
                  <Text>{eta ? formatDateTime(eta) : "Select ETA"}</Text>
                </Button>
                {showEtaPicker && (
                  <DateTimePicker value={eta || new Date()} mode="date" onChange={handleEtaChange} />
                )}
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Order Description</Text>
                <Input
                  value={orderDescription}
                  onChangeText={setOrderDescription}
                  placeholder="Enter description"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Containers</Text>
                <Button variant="outline" onPress={() => setContainerPickerOpen(true)}>
                  <Text>
                    {selectedContainerIds.length > 0
                      ? `${selectedContainerIds.length} selected`
                      : "Select containers"}
                  </Text>
                </Button>

                {selectedContainerRecords.length > 0 && (
                  <View className="gap-2">
                    {selectedContainerRecords.map((c) => (
                      <View key={c.id} className="flex-row items-center justify-between bg-muted p-3 rounded-md">
                        <Text numberOfLines={1} className="flex-1 mr-3">
                          {c.containerNo || c.id}
                        </Text>
                        <Pressable onPress={() => toggleContainer(c.id)}>
                          <Icon as={X} className="size-5 text-destructive" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">MBL copy (files)</Text>
                <Button variant="outline" onPress={pickFiles}>
                  <Text>{files.length > 0 ? `${files.length} file(s) selected` : "Pick files"}</Text>
                </Button>
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Confirm Shipping Line (optional)</Text>
                <Button variant="outline" onPress={pickConfirmShippingLine}>
                  <Text>{confirmShippingLine ? confirmShippingLine.name : "Pick document"}</Text>
                </Button>
                {confirmShippingLine && (
                  <Button variant="ghost" onPress={() => setConfirmShippingLine(null)}>
                    <Text>Remove</Text>
                  </Button>
                )}
              </View>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled={submitting} onPress={handleSubmit}>
                {submitting ? <ActivityIndicator color="white" /> : <Text>Create Order</Text>}
              </Button>
            </CardFooter>
          </Card>
        </View>
      </ScrollView>

      <Modal
        visible={providerPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setProviderPickerOpen(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-background rounded-t-2xl p-4 max-h-[80%]">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold">Select CFS provider</Text>
              <Pressable
                onPress={() => {
                  setProviderPickerOpen(false);
                  setProviderSearch("");
                }}
              >
                <Icon as={X} className="size-6 text-muted-foreground" />
              </Pressable>
            </View>

            <View className="mt-3">
              <Input placeholder="Search provider" value={providerSearch} onChangeText={setProviderSearch} />
              <Text className="text-xs text-muted-foreground mt-2">
                {filteredProviders.length} provider(s)
              </Text>
            </View>

            <ScrollView className="mt-3">
              {filteredProviders.map((p) => (
                <Pressable
                  key={p.id}
                  className="py-3 border-b border-border"
                  onPress={() => {
                    setSelectedProviderId(p.id);
                    setProviderPickerOpen(false);
                    setProviderSearch("");
                  }}
                >
                  <Text className="font-medium">{p.title || p.id}</Text>
                  <Text className="text-xs text-muted-foreground">{p.id}</Text>
                </Pressable>
              ))}
              {filteredProviders.length === 0 && (
                <View className="py-6 items-center">
                  <Text className="text-muted-foreground">No providers found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={containerPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setContainerPickerOpen(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-background rounded-t-2xl p-4 max-h-[80%]">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold">Select containers</Text>
              <Pressable
                onPress={() => {
                  setContainerPickerOpen(false);
                  setContainerSearch("");
                }}
              >
                <Icon as={X} className="size-6 text-muted-foreground" />
              </Pressable>
            </View>

            <View className="mt-3">
              <Input placeholder="Search container" value={containerSearch} onChangeText={setContainerSearch} />
              <Text className="text-xs text-muted-foreground mt-2">
                {filteredContainers.length} container(s)
              </Text>
            </View>

            <ScrollView className="mt-3">
              {filteredContainers.map((c) => {
                const selected = selectedContainerIds.includes(c.id);
                return (
                  <Pressable
                    key={c.id}
                    className={`py-3 border-b border-border ${selected ? "bg-muted/50" : ""}`}
                    onPress={() => toggleContainer(c.id)}
                  >
                    <Text className="font-medium">{c.containerNo || c.id}</Text>
                    <Text className="text-xs text-muted-foreground">{selected ? "Selected" : c.id}</Text>
                  </Pressable>
                );
              })}
              {filteredContainers.length === 0 && (
                <View className="py-6 items-center">
                  <Text className="text-muted-foreground">No containers found</Text>
                </View>
              )}
            </ScrollView>

            <Button
              className="mt-3"
              onPress={() => {
                setContainerPickerOpen(false);
                setContainerSearch("");
              }}
            >
              <Text>Done</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}
