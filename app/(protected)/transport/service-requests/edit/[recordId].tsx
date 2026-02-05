import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

export default function EditTransportServiceRequestPage() {
  // TODO: Implement actual API calls using PocketBase schema fields
  // TODO: Implement Transport-specific validation rules
  // TODO: Implement real-time updates for transport_orders
  // TODO: Implement file upload logic according to PocketBase rules
  // TODO: Implement status transitions exactly as defined in backend
  // TODO: Implement service-type specific business rules
  // TODO: Implement filtering, search, pagination (matching webapp logic)

  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable real field from `transport_service_requests`
  const [customerRemarks, setCustomerRemarks] = useState("");

  useEffect(() => {
    // No API yet
    setLoading(false);
  }, [recordId]);

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      Alert.alert("Not implemented", "Update will be wired in lib/actions/transport/genericServiceRequest.ts");
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
              <CardTitle>Edit transport_service_requests</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">customerRemarks</Text>
                <Input
                  value={customerRemarks}
                  onChangeText={setCustomerRemarks}
                  placeholder="Update customerRemarks"
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

