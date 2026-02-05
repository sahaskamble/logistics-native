import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

export default function EditTransportOrderPage() {
  // TODO: Implement actual API calls using PocketBase schema fields
  // TODO: Implement Transport-specific validation rules
  // TODO: Implement real-time updates for transport_orders
  // TODO: Implement file upload logic according to PocketBase rules
  // TODO: Implement status transitions exactly as defined in backend
  // TODO: Implement service-type specific business rules
  // TODO: Implement filtering, search, pagination (matching webapp logic)

  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable real fields from `transport_orders`
  const [consigneeName, setConsigneeName] = useState("");
  const [chaName, setChaName] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [vehicleDescription, setVehicleDescription] = useState("");
  const [orderDescription, setOrderDescription] = useState("");

  useEffect(() => {
    // No API yet; just initialize form shell
    setLoading(false);
  }, [orderId]);

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      Alert.alert("Not implemented", "Update will be wired in lib/actions/transport/fetch.ts later.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
        <Text className="mt-2">Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `Edit ${orderId || ""}` }} />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit transport_orders</CardTitle>
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
            </CardContent>
            <CardFooter className="gap-2">
              <Button className="flex-1" variant="outline" onPress={() => router.back()}>
                <Text>Cancel</Text>
              </Button>
              <Button className="flex-1" disabled={saving} onPress={onSave}>
                {saving ? <ActivityIndicator color="white" /> : <Text>Save</Text>}
              </Button>
            </CardFooter>
          </Card>
        </View>
      </ScrollView>
    </>
  );
}

