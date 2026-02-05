import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

export default function CreateTransportOrderMovementPage() {
  // TODO: Implement actual API calls using PocketBase schema fields
  // TODO: Implement Transport-specific validation rules
  // TODO: Implement real-time updates for transport_orders
  // TODO: Implement file upload logic according to PocketBase rules
  // TODO: Implement status transitions exactly as defined in backend
  // TODO: Implement service-type specific business rules
  // TODO: Implement filtering, search, pagination (matching webapp logic)

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Real schema fields for `transport_order_movement`
  const [order, setOrder] = useState("");
  const [jobOrder, setJobOrder] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [driver, setDriver] = useState<string>("{}"); // driver is json in schema

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [startLocation, setStartLocation] = useState(""); // geoPoint in schema (lat,lng). UI will be upgraded later.
  const [currentLocation, setCurrentLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [remarks, setRemarks] = useState("");

  const onSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      Alert.alert("Not implemented", "Create will be wired in lib/actions/transport/serviceTypes/orderMovement.ts");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Create Order Movement" }} />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>transport_order_movement</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">order (relation to transport_orders)</Text>
                <Input value={order} onChangeText={setOrder} placeholder="ORD-..." autoCapitalize="characters" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">jobOrder (relation to transport_job_order)</Text>
                <Input value={jobOrder} onChangeText={setJobOrder} placeholder="JOB-..." autoCapitalize="characters" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">vehicle (relation)</Text>
                <Input value={vehicle} onChangeText={setVehicle} placeholder="Vehicle record id" autoCapitalize="characters" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">driver (json)</Text>
                <Input value={driver} onChangeText={setDriver} placeholder="{...}" multiline numberOfLines={4} />
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
                <Text className="text-sm text-muted-foreground">startLocation (geoPoint)</Text>
                <Input value={startLocation} onChangeText={setStartLocation} placeholder="lat,lng" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">currentLocation (geoPoint)</Text>
                <Input value={currentLocation} onChangeText={setCurrentLocation} placeholder="lat,lng" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">endLocation (geoPoint)</Text>
                <Input value={endLocation} onChangeText={setEndLocation} placeholder="lat,lng" />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">remarks</Text>
                <Input value={remarks} onChangeText={setRemarks} placeholder="Enter remarks" multiline numberOfLines={4} />
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
    </>
  );
}

