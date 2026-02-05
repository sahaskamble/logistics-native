import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

export default function EditTransportPricingRequestPage() {
  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [preferableRate, setPreferableRate] = useState("");
  const [containersPerMonth, setContainersPerMonth] = useState("");

  useEffect(() => {
    setLoading(false);
  }, [recordId]);

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      Alert.alert(
        "Not implemented",
        "Update will be wired in lib/actions/transport/pricingRequest.ts"
      );
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
      <Stack.Screen options={{ title: `Edit ${recordId || ""}` }} />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit transport_pricing_request</CardTitle>
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
