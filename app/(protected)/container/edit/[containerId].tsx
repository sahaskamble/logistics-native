import { useState, useEffect } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from "@/components/ui/select";
import { statusOptions, sizeOptions } from "@/components/container";
import type { ContainerRecord, ContainersStatus } from "@/components/container";

export default function ContainerEditPage() {
  const router = useRouter();
  const { containerId } = useLocalSearchParams<{ containerId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [container, setContainer] = useState<ContainerRecord | null>(null);
  const [formData, setFormData] = useState({
    containerNo: "",
    size: undefined as Option | undefined,
    status: undefined as Option | undefined,
    cargoType: "",
  });

  useEffect(() => {
    async function load() {
      if (!containerId) {
        setLoading(false);
        return;
      }
      try {
        const record = await pb.collection("containers").getOne<ContainerRecord>(containerId);
        setContainer(record);
        setFormData({
          containerNo: record.containerNo || "",
          size: record.size ? { value: record.size, label: record.size } : undefined,
          status: record.status ? { value: record.status, label: record.status } : undefined,
          cargoType: record.cargoType || "",
        });
      } catch (error: any) {
        console.error("Error loading container:", error);
        Alert.alert("Error", "Failed to load container.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [containerId]);

  const handleSave = async () => {
    if (!formData.containerNo.trim()) {
      Alert.alert("Error", "Container number is required.");
      return;
    }
    if (!containerId) return;

    try {
      setSaving(true);
      const user = getCurrentUser();
      if (!user.isValid || !user.user?.id) {
        Alert.alert("Error", "User not authenticated.");
        setSaving(false);
        return;
      }

      const data: Record<string, unknown> = {
        containerNo: formData.containerNo.trim(),
        size: formData.size?.value || undefined,
        status: (formData.status?.value as ContainersStatus) || undefined,
        cargoType: formData.cargoType.trim() || undefined,
      };

      await pb.collection("containers").update(containerId, data);
      Alert.alert("Success", "Container updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Error saving container:", error);
      Alert.alert("Error", error.message || "Failed to save container.");
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

  if (!container) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-muted-foreground">Container not found</Text>
        <Button variant="outline" className="mt-4" onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Edit Container" }} />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <View className="gap-2">
            <Label>Container Number *</Label>
            <Input
              value={formData.containerNo}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, containerNo: text }))}
              placeholder="Enter container number"
            />
          </View>

          <View className="gap-2">
            <Label>Size</Label>
            <Select
              value={formData.size || undefined}
              onValueChange={(value: Option) => setFormData((prev) => ({ ...prev, size: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {sizeOptions.map((size) =>
                  size?.value && size?.label ? (
                    <SelectItem key={size.value} value={size.value} label={size.label}>
                      {size.label}
                    </SelectItem>
                  ) : null
                )}
              </SelectContent>
            </Select>
          </View>

          <View className="gap-2">
            <Label>Status</Label>
            <Select
              value={formData.status || undefined}
              onValueChange={(value: Option) => setFormData((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) =>
                  status?.value && status?.label ? (
                    <SelectItem key={status.value} value={status.value} label={status.label}>
                      {status.label}
                    </SelectItem>
                  ) : null
                )}
              </SelectContent>
            </Select>
          </View>

          <View className="gap-2">
            <Label>Cargo Type</Label>
            <Input
              value={formData.cargoType}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, cargoType: text }))}
              placeholder="Enter cargo type"
            />
          </View>

          <View className="flex-row gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text>Cancel</Text>
            </Button>
            <Button className="flex-1" onPress={handleSave} disabled={saving}>
              <Text>{saving ? "Saving..." : "Save"}</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
