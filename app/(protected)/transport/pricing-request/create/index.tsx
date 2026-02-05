import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

export default function CreateTransportPricingRequestPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [preferableRate, setPreferableRate] = useState("");
  const [containersPerMonth, setContainersPerMonth] = useState("");

  const onSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      Alert.alert(
        "Not implemented",
        "Create will be wired in lib/actions/transport/pricingRequest.ts"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Create Pricing Request" }} />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>transport_pricing_request</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Start location</Text>
                <Input value={startLocation} onChangeText={setStartLocation} placeholder="Start location" />
              </View>
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">End location</Text>
                <Input value={endLocation} onChangeText={setEndLocation} placeholder="End location" />
              </View>
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Special request</Text>
                <Input
                  value={specialRequest}
                  onChangeText={setSpecialRequest}
                  placeholder="Special request"
                  multiline
                  numberOfLines={3}
                />
              </View>
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Preferable rate</Text>
                <Input
                  value={preferableRate}
                  onChangeText={setPreferableRate}
                  placeholder="Rate"
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Containers per month</Text>
                <Input
                  value={containersPerMonth}
                  onChangeText={setContainersPerMonth}
                  placeholder="Containers per month"
                  keyboardType="numeric"
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
    </>
  );
}
