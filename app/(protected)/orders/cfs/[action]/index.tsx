import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  createCfsOrder,
  listContainersForCurrentUser,
  listVerifiedCfsProviders,
  type CfsProvider,
  type UserContainer,
} from "@/lib/actions/cfs/createOrder";

type PickedFile = {
  uri: string;
  name: string;
  type: string;
};

type DefinedOption = Option & { value: string; label: string };

function isDefinedOption(opt?: Option): opt is DefinedOption {
  return !!opt && typeof opt.value === "string" && !!opt.value && typeof opt.label === "string" && !!opt.label;
}

function toPickedFile(result: DocumentPicker.DocumentPickerResult): PickedFile | null {
  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset?.uri) return null;

  return {
    uri: asset.uri,
    name: asset.name || "document",
    type: asset.mimeType || "application/octet-stream",
  };
}

function formatDateTime(d?: Date | null) {
  if (!d) return "";
  try {
    return d.toLocaleString();
  } catch {
    return String(d);
  }
}

export default function CfsOrdersActionPage() {
  const router = useRouter();
  const { action } = useLocalSearchParams<{ action?: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [providers, setProviders] = useState<CfsProvider[]>([]);
  const [containers, setContainers] = useState<UserContainer[]>([]);

  const [showContainersModal, setShowContainersModal] = useState(false);
  const [showEtaPicker, setShowEtaPicker] = useState(false);

  const handleEtaChange = (event: any, selectedDate?: Date) => {
    if (event?.type === "dismissed") {
      console.log("Event Type", event?.type)
      DateTimePickerAndroid.dismiss('date');
      setTimeout(() => setShowEtaPicker(false), 0);
      return;
    }

    if (selectedDate) {
      setForm((p) => ({ ...p, eta: selectedDate }));
    }

    setTimeout(() => setShowEtaPicker(false), 0);
  };

  const [form, setForm] = useState({
    igmNo: "",
    blNo: "",
    itemNo: "",
    consigneeName: "",
    chaName: "",
    cfs: undefined as Option | undefined,
    dpdType: undefined as Option | undefined,
    shipping_line: "",
    eta: undefined as Date | undefined,
    deliveryType: undefined as Option | undefined,
    orderDescription: "",
    selectedContainerIds: [] as string[],
    files: null as PickedFile | null,
    hblcopy: null as PickedFile | null,
    confirmShippingLine: null as PickedFile | null,
  });

  const dpdTypeOptions: Option[] = useMemo(
    () => [
      { value: "DPD", label: "DPD" },
      { value: "Non-DPD", label: "Non-DPD" },
    ],
    []
  );

  const deliveryTypeOptions: Option[] = useMemo(
    () => [
      { value: "Loaded", label: "Loaded" },
      { value: "Destuffed", label: "Destuffed" },
    ],
    []
  );

  const providerOptions: Option[] = useMemo(() => {
    return providers
      .map((p) => ({
        value: p.id,
        label: p.title || `Provider #${p.id.slice(0, 8)}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [providers]);

  const selectedContainers = useMemo(() => {
    const set = new Set(form.selectedContainerIds);
    return containers.filter((c) => set.has(c.id));
  }, [containers, form.selectedContainerIds]);

  const resetForm = () => {
    setForm({
      igmNo: "",
      blNo: "",
      itemNo: "",
      consigneeName: "",
      chaName: "",
      cfs: undefined,
      dpdType: undefined,
      shipping_line: "",
      eta: undefined,
      deliveryType: undefined,
      orderDescription: "",
      selectedContainerIds: [],
      files: null,
      hblcopy: null,
      confirmShippingLine: null,
    });
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (action !== "new") {
        setLoading(false);
        return;
      }

      setLoading(true);

      const [providersRes, containersRes] = await Promise.all([
        listVerifiedCfsProviders(),
        listContainersForCurrentUser(),
      ]);

      if (!mounted) return;

      if (!providersRes.success) {
        Alert.alert("Error", providersRes.message);
      }
      if (!containersRes.success) {
        Alert.alert("Error", containersRes.message);
      }

      setProviders(providersRes.output || []);
      setContainers(containersRes.output || []);
      setLoading(false);
    };

    run();

    return () => {
      mounted = false;
    };
  }, [action]);

  const pickDoc = async (title: string) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });
      const file = toPickedFile(res);
      if (!file) return null;
      return file;
    } catch (err: any) {
      Alert.alert("Error", err?.message || `Failed to pick ${title}.`);
      return null;
    }
  };

  const toggleContainer = (containerId: string) => {
    setForm((prev) => {
      const set = new Set(prev.selectedContainerIds);
      if (set.has(containerId)) set.delete(containerId);
      else set.add(containerId);
      return { ...prev, selectedContainerIds: Array.from(set) };
    });
  };

  const handleSubmit = async () => {
    try {
      if (submitting) return;

      setSubmitting(true);

      const res = await createCfsOrder({
        igmNo: form.igmNo,
        blNo: form.blNo,
        itemNo: form.itemNo,
        consigneeName: form.consigneeName,
        chaName: form.chaName,
        cfs: form.cfs?.value,
        dpdType: (form.dpdType?.value as any) || undefined,
        shipping_line: form.shipping_line,
        eta: form.eta,
        deliveryType: (form.deliveryType?.value as any) || undefined,
        orderDescription: form.orderDescription,
        containers: form.selectedContainerIds,
        files: form.files,
        hblcopy: form.hblcopy,
        confirmShippingLine: form.confirmShippingLine,
      });

      if (!res.success) {
        Alert.alert("Error", res.message);
        setSubmitting(false);
        return;
      }

      resetForm();
      Alert.alert("Success", "Order created successfully.");
      router.replace("/(protected)/orders/cfs");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const a = (action || "").toString().trim();
    if (!a || a === "new") return;

    router.replace({
      pathname: "/(protected)/orders/cfs/[orderId]",
      params: { orderId: a },
    } as any);
  }, [action, router]);

  if (action !== "new") {
    const a = (action || "").toString().trim();
    return (
      <View className="flex-1 items-center justify-center p-4 bg-background">
        <ActivityIndicator />
        <Text className="mt-2 text-muted-foreground">
          Opening order{a ? ` (${a})` : ""}...
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
        <Text className="mt-2 text-muted-foreground">Loading form...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Create CFS Order" }} />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New CFS Order</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="text-muted-foreground">
                Fill the details below. Fields marked as required must be provided.
              </Text>
            </CardContent>
          </Card>

          {/* Shipment details */}
          <Card>
            <CardHeader>
              <CardTitle>Shipment details</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <View className="gap-2">
                <Label>IGM No</Label>
                <Input value={form.igmNo} onChangeText={(v) => setForm((p) => ({ ...p, igmNo: v }))} placeholder="Enter IGM No" />
              </View>

              <View className="gap-2">
                <Label>BL No</Label>
                <Input value={form.blNo} onChangeText={(v) => setForm((p) => ({ ...p, blNo: v }))} placeholder="Enter BL No" />
              </View>

              <View className="gap-2">
                <Label>Item No</Label>
                <Input value={form.itemNo} onChangeText={(v) => setForm((p) => ({ ...p, itemNo: v }))} placeholder="Enter Item No" />
              </View>

              <View className="gap-2">
                <Label>ETA</Label>
                <Button variant="outline" onPress={() => setShowEtaPicker(true)}>
                  <Text>{form.eta ? formatDateTime(form.eta) : "Select ETA"}</Text>
                </Button>
                {showEtaPicker && (
                  <DateTimePicker
                    value={form.eta || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    is24Hour={false}
                    onChange={handleEtaChange}
                  />
                )}
              </View>

              <View className="gap-2">
                <Label>Shipping line</Label>
                <Input
                  value={form.shipping_line}
                  onChangeText={(v) => setForm((p) => ({ ...p, shipping_line: v }))}
                  placeholder="Enter shipping line"
                />
              </View>
            </CardContent>
          </Card>

          {/* Party details */}
          <Card>
            <CardHeader>
              <CardTitle>Party details</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <View className="gap-2">
                <Label>Consignee name</Label>
                <Input
                  value={form.consigneeName}
                  onChangeText={(v) => setForm((p) => ({ ...p, consigneeName: v }))}
                  placeholder="Enter consignee name"
                />
              </View>

              <View className="gap-2">
                <Label>CHA name</Label>
                <Input value={form.chaName} onChangeText={(v) => setForm((p) => ({ ...p, chaName: v }))} placeholder="Enter CHA name" />
              </View>
            </CardContent>
          </Card>

          {/* CFS & delivery details */}
          <Card>
            <CardHeader>
              <CardTitle>CFS & delivery details</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <View className="gap-2">
                <Label>CFS provider (required)</Label>
                <Select
                  value={form.cfs}
                  onValueChange={(opt?: Option) => setForm((p) => ({ ...p, cfs: opt }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select CFS provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerOptions.filter(isDefinedOption).map((o) => (
                      <SelectItem key={o.value} value={o.value} label={o.label}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Text className="text-xs text-muted-foreground">Only verified providers offering CFS are shown.</Text>
              </View>

              <View className="gap-2">
                <Label>DPD type (required)</Label>
                <Select
                  value={form.dpdType}
                  onValueChange={(opt?: Option) => setForm((p) => ({ ...p, dpdType: opt }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select DPD / Non-DPD" />
                  </SelectTrigger>
                  <SelectContent>
                    {dpdTypeOptions.filter(isDefinedOption).map((o) => (
                      <SelectItem key={o.value} value={o.value} label={o.label}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </View>

              <View className="gap-2">
                <Label>Delivery type (required)</Label>
                <Select
                  value={form.deliveryType}
                  onValueChange={(opt?: Option) => setForm((p) => ({ ...p, deliveryType: opt }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Loaded / Destuffed" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryTypeOptions.filter(isDefinedOption).map((o) => (
                      <SelectItem key={o.value} value={o.value} label={o.label}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </View>

              <View className="gap-2">
                <Label>Order description</Label>
                <Textarea
                  value={form.orderDescription}
                  onChangeText={(v) => setForm((p) => ({ ...p, orderDescription: v }))}
                  placeholder="Add any details about the order"
                />
              </View>
            </CardContent>
          </Card>

          {/* Containers */}
          <Card>
            <CardHeader>
              <CardTitle>Containers</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Selected: {form.selectedContainerIds.length}</Text>
                <Button variant="outline" onPress={() => setShowContainersModal(true)}>
                  <Text>Select containers</Text>
                </Button>
              </View>

              {selectedContainers.length > 0 && (
                <View className="flex-row flex-wrap gap-2">
                  {selectedContainers.map((c) => (
                    <Badge key={c.id} variant="secondary">
                      <Text>{c.containerNo || c.id.slice(0, 8)}</Text>
                    </Badge>
                  ))}
                </View>
              )}

              {containers.length === 0 && (
                <Text className="text-sm text-muted-foreground">No containers found. Add containers first.</Text>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <View className="gap-2">
                <Label>MBL copy (required)</Label>
                <Button
                  variant="outline"
                  onPress={async () => {
                    const file = await pickDoc("MBL copy");
                    if (file) setForm((p) => ({ ...p, files: file }));
                  }}
                >
                  <Text>{form.files ? form.files.name : "Pick file"}</Text>
                </Button>
                {form.files && (
                  <Button variant="ghost" onPress={() => setForm((p) => ({ ...p, files: null }))}>
                    <Text>Remove</Text>
                  </Button>
                )}
              </View>

              <View className="gap-2">
                <Label>HBL copy (optional)</Label>
                <Button
                  variant="outline"
                  onPress={async () => {
                    const file = await pickDoc("HBL copy");
                    if (file) setForm((p) => ({ ...p, hblcopy: file }));
                  }}
                >
                  <Text>{form.hblcopy ? form.hblcopy.name : "Pick file"}</Text>
                </Button>
                {form.hblcopy && (
                  <Button variant="ghost" onPress={() => setForm((p) => ({ ...p, hblcopy: null }))}>
                    <Text>Remove</Text>
                  </Button>
                )}
              </View>

              <View className="gap-2">
                <Label>Shipping line confirmation (optional)</Label>
                <Button
                  variant="outline"
                  onPress={async () => {
                    const file = await pickDoc("Shipping line confirmation");
                    if (file) setForm((p) => ({ ...p, confirmShippingLine: file }));
                  }}
                >
                  <Text>{form.confirmShippingLine ? form.confirmShippingLine.name : "Pick file"}</Text>
                </Button>
                {form.confirmShippingLine && (
                  <Button variant="ghost" onPress={() => setForm((p) => ({ ...p, confirmShippingLine: null }))}>
                    <Text>Remove</Text>
                  </Button>
                )}
              </View>
            </CardContent>
          </Card>

          <Button disabled={submitting} onPress={handleSubmit} className="">
            {submitting ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator color="white" />
                <Text className="text-white">Submitting...</Text>
              </View>
            ) : (
              <Text className="text-white">Create Order</Text>
            )}
          </Button>

          <Button
            variant="ghost"
            disabled={submitting}
            onPress={() => {
              resetForm();
              router.replace("/(protected)/orders/cfs");
            }}
          >
            <Text>Cancel</Text>
          </Button>
        </View>

        <Dialog open={showContainersModal} onOpenChange={setShowContainersModal}>
          <DialogContent className="min-w-[300px] px-4">
            <DialogHeader>
              <DialogTitle>Select containers</DialogTitle>
            </DialogHeader>

            <ScrollView className="max-h-[400px] px-4">
              <View className="gap-3">
                {containers.map((c) => {
                  const checked = form.selectedContainerIds.includes(c.id);
                  return (
                    <View key={c.id} className="flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="font-medium">{c.containerNo || c.id.slice(0, 8)}</Text>
                        <Text className="text-xs text-muted-foreground">
                          {c.size ? `Size: ${c.size}` : ""}{c.status ? `  •  Status: ${c.status}` : ""}
                        </Text>
                      </View>

                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleContainer(c.id)}
                        accessibilityLabel={`Select container ${c.containerNo || c.id}`}
                      />
                    </View>
                  );
                })}

                {containers.length === 0 && (
                  <Text className="text-sm text-muted-foreground">No containers available.</Text>
                )}
              </View>
            </ScrollView>

            <View className="flex-row gap-2 justify-end">
              <Button variant="outline" onPress={() => setShowContainersModal(false)}>
                <Text>Done</Text>
              </Button>
            </View>
          </DialogContent>
        </Dialog>
      </ScrollView>
    </>
  );
}
