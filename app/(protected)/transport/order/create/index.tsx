import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { X } from "lucide-react-native";

type PickedFile = { uri: string; name: string; type: string };

export default function CreateTransportOrderPage() {
  // TODO: Implement actual API calls using PocketBase schema fields
  // TODO: Implement Transport-specific validation rules
  // TODO: Implement real-time updates for transport_orders
  // TODO: Implement file upload logic according to PocketBase rules
  // TODO: Implement status transitions exactly as defined in backend
  // TODO: Implement service-type specific business rules
  // TODO: Implement filtering, search, pagination (matching webapp logic)

  const router = useRouter();

  // Real schema fields for `transport_orders`
  const [consigneeName, setConsigneeName] = useState("");
  const [chaName, setChaName] = useState("");
  const [provider, setProvider] = useState<string | null>(null);
  const [customer] = useState<string>(""); // read-only placeholder; actual value from auth later

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [vehicleDescription, setVehicleDescription] = useState("");
  const [orderDescription, setOrderDescription] = useState("");

  const [files, setFiles] = useState<PickedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Provider picker skeleton (real field `provider` is a relation)
  const [providerPickerOpen, setProviderPickerOpen] = useState(false);
  const [providerSearch, setProviderSearch] = useState("");
  const providerOptions = useMemo(() => {
    // No API yet; will be populated via service_provider filtered by Transport service
    return [] as Array<{ id: string; title?: string }>;
  }, []);
  const filteredProviders = useMemo(() => {
    const q = providerSearch.trim().toLowerCase();
    if (!q) return providerOptions;
    return providerOptions.filter((p) => (p.title || "").toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  }, [providerOptions, providerSearch]);

  const pickFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;
      const mapped: PickedFile[] = (res.assets || [])
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

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { createTransportOrder } = await import("@/lib/actions/transport/createOrder");
      const res = await createTransportOrder({
        consigneeName: consigneeName.trim() || undefined,
        chaName: chaName.trim() || undefined,
        provider: provider || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        startLocation: startLocation.trim() || undefined,
        endLocation: endLocation.trim() || undefined,
        specialRequest: specialRequest.trim() || undefined,
        vehicleDescription: vehicleDescription.trim() || undefined,
        orderDescription: orderDescription.trim() || undefined,
        files: files.length > 0 ? files : undefined,
      });
      if (res.success) {
        Alert.alert("Success", res.message, [{ text: "OK", onPress: () => router.back() }]);
      } else {
        Alert.alert("Error", res.message);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Create Transport Order" }} />

      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>transport_orders</CardTitle>
            </CardHeader>

            <CardContent className="gap-4">
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">consigneeName</Text>
                <Input value={consigneeName} onChangeText={setConsigneeName} placeholder="Consignee Name" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">chaName</Text>
                <Input value={chaName} onChangeText={setChaName} placeholder="CHA Name" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">provider (relation)</Text>
                <Button variant="outline" onPress={() => setProviderPickerOpen(true)}>
                  <Text>{provider || "Select provider"}</Text>
                </Button>
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">customer (relation)</Text>
                <Input value={customer} editable={false} placeholder="(auto from auth)" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">startDate</Text>
                <Button variant="outline" onPress={() => setShowStartPicker(true)}>
                  <Text>{startDate ? startDate.toDateString() : "Select startDate"}</Text>
                </Button>
                {showStartPicker && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    onChange={(event: any, d?: Date) => {
                      if (event?.type === "dismissed") return setTimeout(() => setShowStartPicker(false), 0);
                      if (d) setStartDate(d);
                      setTimeout(() => setShowStartPicker(false), 0);
                    }}
                  />
                )}
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">startLocation</Text>
                <Input value={startLocation} onChangeText={setStartLocation} placeholder="Start Location" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">endDate</Text>
                <Button variant="outline" onPress={() => setShowEndPicker(true)}>
                  <Text>{endDate ? endDate.toDateString() : "Select endDate"}</Text>
                </Button>
                {showEndPicker && (
                  <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    onChange={(event: any, d?: Date) => {
                      if (event?.type === "dismissed") return setTimeout(() => setShowEndPicker(false), 0);
                      if (d) setEndDate(d);
                      setTimeout(() => setShowEndPicker(false), 0);
                    }}
                  />
                )}
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">endLocation</Text>
                <Input value={endLocation} onChangeText={setEndLocation} placeholder="End Location" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">vehicleDescription</Text>
                <Input value={vehicleDescription} onChangeText={setVehicleDescription} placeholder="Vehicle Description" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">specialRequest</Text>
                <Input value={specialRequest} onChangeText={setSpecialRequest} placeholder="Special Request" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">orderDescription</Text>
                <Input
                  value={orderDescription}
                  onChangeText={setOrderDescription}
                  placeholder="Order Description"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">files (file)</Text>
                <Button variant="outline" onPress={pickFiles}>
                  <Text>{files.length > 0 ? `${files.length} file(s) selected` : "Pick files"}</Text>
                </Button>
                {files.length > 0 && (
                  <View className="gap-2">
                    {files.map((f) => (
                      <View key={f.uri} className="flex-row items-center justify-between bg-muted p-3 rounded-md">
                        <Text className="flex-1 mr-3" numberOfLines={1}>
                          {f.name}
                        </Text>
                        <Pressable onPress={() => setFiles((prev) => prev.filter((x) => x.uri !== f.uri))}>
                          <Icon as={X} className="size-5 text-destructive" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </CardContent>

            <CardFooter className="gap-2">
              <Button className="flex-1" variant="outline" onPress={() => router.back()}>
                <Text>Cancel</Text>
              </Button>
              <Button className="flex-1" disabled={submitting} onPress={handleSubmit}>
                {submitting ? <ActivityIndicator color="white" /> : <Text>Create</Text>}
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
              <Text className="text-lg font-semibold">Select provider</Text>
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
              <Text className="text-xs text-muted-foreground mt-2">{filteredProviders.length} provider(s)</Text>
            </View>

            <ScrollView className="mt-3">
              {filteredProviders.map((p) => (
                <Pressable
                  key={p.id}
                  className="py-3 border-b border-border"
                  onPress={() => {
                    setProvider(p.id);
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
                  <Text className="text-muted-foreground">No providers loaded yet</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

