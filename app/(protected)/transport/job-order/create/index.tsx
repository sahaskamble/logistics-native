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

export default function CreateTransportJobOrderPage() {
  // TODO: Implement actual API calls using PocketBase schema fields
  // TODO: Implement Transport-specific validation rules
  // TODO: Implement real-time updates for transport_orders
  // TODO: Implement file upload logic according to PocketBase rules
  // TODO: Implement status transitions exactly as defined in backend
  // TODO: Implement service-type specific business rules
  // TODO: Implement filtering, search, pagination (matching webapp logic)

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Real schema fields for `transport_job_order`
  const [order, setOrder] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [serviceType, setServiceType] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [remarks, setRemarks] = useState("");
  const [files, setFiles] = useState<PickedFile[]>([]);

  // Pickers skeleton (relations)
  const [serviceTypePickerOpen, setServiceTypePickerOpen] = useState(false);
  const [vehiclePickerOpen, setVehiclePickerOpen] = useState(false);
  const [serviceTypeSearch, setServiceTypeSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");

  const serviceTypeOptions = useMemo(() => [] as Array<{ id: string; title?: string }>, []);
  const vehicleOptions = useMemo(() => [] as Array<{ id: string; title?: string }>, []);

  const filteredServiceTypes = useMemo(() => {
    const q = serviceTypeSearch.trim().toLowerCase();
    if (!q) return serviceTypeOptions;
    return serviceTypeOptions.filter((s) => (s.title || "").toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  }, [serviceTypeOptions, serviceTypeSearch]);

  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.trim().toLowerCase();
    if (!q) return vehicleOptions;
    return vehicleOptions.filter((v) => (v.title || "").toLowerCase().includes(q) || v.id.toLowerCase().includes(q));
  }, [vehicleOptions, vehicleSearch]);

  const toggleVehicle = (id: string) => {
    setVehicles((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return Array.from(set);
    });
  };

  const pickFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
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

  const onSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      Alert.alert("Not implemented", "Create will be wired in lib/actions/transport/serviceTypes/jobOrder.ts");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Create Job Order" }} />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>transport_job_order</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">order (relation)</Text>
                <Input value={order} onChangeText={setOrder} placeholder="ORD-..." autoCapitalize="characters" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">fromDate</Text>
                <Button variant="outline" onPress={() => setShowFromPicker(true)}>
                  <Text>{fromDate ? fromDate.toDateString() : "Select fromDate"}</Text>
                </Button>
                {showFromPicker && (
                  <DateTimePicker
                    value={fromDate || new Date()}
                    mode="date"
                    onChange={(event: any, d?: Date) => {
                      if (event?.type === "dismissed") return setTimeout(() => setShowFromPicker(false), 0);
                      if (d) setFromDate(d);
                      setTimeout(() => setShowFromPicker(false), 0);
                    }}
                  />
                )}
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">toDate</Text>
                <Button variant="outline" onPress={() => setShowToPicker(true)}>
                  <Text>{toDate ? toDate.toDateString() : "Select toDate"}</Text>
                </Button>
                {showToPicker && (
                  <DateTimePicker
                    value={toDate || new Date()}
                    mode="date"
                    onChange={(event: any, d?: Date) => {
                      if (event?.type === "dismissed") return setTimeout(() => setShowToPicker(false), 0);
                      if (d) setToDate(d);
                      setTimeout(() => setShowToPicker(false), 0);
                    }}
                  />
                )}
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">serviceType (relation)</Text>
                <Button variant="outline" onPress={() => setServiceTypePickerOpen(true)}>
                  <Text>{serviceType || "Select serviceType"}</Text>
                </Button>
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">vehicles (relation[])</Text>
                <Button variant="outline" onPress={() => setVehiclePickerOpen(true)}>
                  <Text>{vehicles.length > 0 ? `${vehicles.length} selected` : "Select vehicles"}</Text>
                </Button>
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">remarks</Text>
                <Input value={remarks} onChangeText={setRemarks} placeholder="Enter remarks" multiline numberOfLines={4} />
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
              <Button className="flex-1" disabled={submitting} onPress={onSubmit}>
                {submitting ? <ActivityIndicator color="white" /> : <Text>Create</Text>}
              </Button>
            </CardFooter>
          </Card>
        </View>
      </ScrollView>

      <Modal visible={serviceTypePickerOpen} transparent animationType="slide" onRequestClose={() => setServiceTypePickerOpen(false)}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-background rounded-t-2xl p-4 max-h-[80%]">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold">Select serviceType</Text>
              <Pressable
                onPress={() => {
                  setServiceTypePickerOpen(false);
                  setServiceTypeSearch("");
                }}
              >
                <Icon as={X} className="size-6 text-muted-foreground" />
              </Pressable>
            </View>
            <View className="mt-3">
              <Input placeholder="Search serviceType" value={serviceTypeSearch} onChangeText={setServiceTypeSearch} />
              <Text className="text-xs text-muted-foreground mt-2">{filteredServiceTypes.length} option(s)</Text>
            </View>
            <ScrollView className="mt-3">
              {filteredServiceTypes.map((s) => (
                <Pressable
                  key={s.id}
                  className="py-3 border-b border-border"
                  onPress={() => {
                    setServiceType(s.id);
                    setServiceTypePickerOpen(false);
                    setServiceTypeSearch("");
                  }}
                >
                  <Text className="font-medium">{s.title || s.id}</Text>
                  <Text className="text-xs text-muted-foreground">{s.id}</Text>
                </Pressable>
              ))}
              {filteredServiceTypes.length === 0 && (
                <View className="py-6 items-center">
                  <Text className="text-muted-foreground">No service types loaded yet</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={vehiclePickerOpen} transparent animationType="slide" onRequestClose={() => setVehiclePickerOpen(false)}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-background rounded-t-2xl p-4 max-h-[80%]">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold">Select vehicles</Text>
              <Pressable
                onPress={() => {
                  setVehiclePickerOpen(false);
                  setVehicleSearch("");
                }}
              >
                <Icon as={X} className="size-6 text-muted-foreground" />
              </Pressable>
            </View>
            <View className="mt-3">
              <Input placeholder="Search vehicles" value={vehicleSearch} onChangeText={setVehicleSearch} />
              <Text className="text-xs text-muted-foreground mt-2">{filteredVehicles.length} vehicle(s)</Text>
            </View>
            <ScrollView className="mt-3">
              {filteredVehicles.map((v) => {
                const selected = vehicles.includes(v.id);
                return (
                  <Pressable
                    key={v.id}
                    className={`py-3 border-b border-border ${selected ? "bg-muted/50" : ""}`}
                    onPress={() => toggleVehicle(v.id)}
                  >
                    <Text className="font-medium">{v.title || v.id}</Text>
                    <Text className="text-xs text-muted-foreground">{selected ? "Selected" : v.id}</Text>
                  </Pressable>
                );
              })}
              {filteredVehicles.length === 0 && (
                <View className="py-6 items-center">
                  <Text className="text-muted-foreground">No vehicles loaded yet</Text>
                </View>
              )}
            </ScrollView>
            <Button
              className="mt-3"
              onPress={() => {
                setVehiclePickerOpen(false);
                setVehicleSearch("");
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

