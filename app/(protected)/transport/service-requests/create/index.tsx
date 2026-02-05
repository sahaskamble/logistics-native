import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { X } from "lucide-react-native";

export default function CreateTransportServiceRequestPage() {
  // TODO: Implement actual API calls using PocketBase schema fields
  // TODO: Implement Transport-specific validation rules
  // TODO: Implement real-time updates for transport_orders
  // TODO: Implement file upload logic according to PocketBase rules
  // TODO: Implement status transitions exactly as defined in backend
  // TODO: Implement service-type specific business rules
  // TODO: Implement filtering, search, pagination (matching webapp logic)

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Real schema fields for `transport_service_requests`
  const [order, setOrder] = useState("");
  const [serviceType, setServiceType] = useState<string | null>(null);
  const [customerRemarks, setCustomerRemarks] = useState("");

  // ServiceType picker skeleton (real field `serviceType` is relation to `sub_services`)
  const [serviceTypePickerOpen, setServiceTypePickerOpen] = useState(false);
  const [serviceTypeSearch, setServiceTypeSearch] = useState("");
  const serviceTypeOptions = useMemo(() => {
    // No API yet; will be populated by listing `sub_services` for the Transport service.
    return [] as Array<{ id: string; title?: string }>;
  }, []);
  const filteredServiceTypes = useMemo(() => {
    const q = serviceTypeSearch.trim().toLowerCase();
    if (!q) return serviceTypeOptions;
    return serviceTypeOptions.filter((s) => (s.title || "").toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  }, [serviceTypeOptions, serviceTypeSearch]);

  const onSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      Alert.alert("Not implemented", "Create will be wired in lib/actions/transport/genericServiceRequest.ts");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Create Transport Service Request" }} />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>transport_service_requests</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">order (relation to transport_orders)</Text>
                <Input value={order} onChangeText={setOrder} placeholder="ORD-..." autoCapitalize="characters" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">serviceType (relation to sub_services)</Text>
                <Button variant="outline" onPress={() => setServiceTypePickerOpen(true)}>
                  <Text>{serviceType || "Select serviceType"}</Text>
                </Button>
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">customerRemarks</Text>
                <Input
                  value={customerRemarks}
                  onChangeText={setCustomerRemarks}
                  placeholder="Enter customerRemarks"
                  multiline
                  numberOfLines={4}
                />
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

      <Modal
        visible={serviceTypePickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setServiceTypePickerOpen(false)}
      >
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
    </>
  );
}

