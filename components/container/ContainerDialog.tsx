import { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from "@/components/ui/select";
import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { statusOptions, sizeOptions } from "./types";
import type { ContainerRecord, ContainersStatus } from "./types";

export interface ContainerDialogProps {
  container: ContainerRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function ContainerDialog({
  container,
  open,
  onOpenChange,
  onSave,
}: ContainerDialogProps) {
  const [formData, setFormData] = useState({
    containerNo: "",
    size: undefined as Option | undefined,
    status: undefined as Option | undefined,
    cargoType: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (container) {
      setFormData({
        containerNo: container.containerNo || "",
        size: container.size ? { value: container.size, label: container.size } : undefined,
        status: container.status ? { value: container.status, label: container.status } : undefined,
        cargoType: container.cargoType || "",
      });
    } else {
      setFormData({
        containerNo: "",
        size: undefined,
        status: undefined,
        cargoType: "",
      });
    }
  }, [container, open]);

  const handleSave = async () => {
    if (!formData.containerNo.trim()) {
      Alert.alert("Error", "Container number is required.");
      return;
    }

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
        ownedBy: user.user.id,
      };

      if (container) {
        await pb.collection("containers").update(container.id, data);
        Alert.alert("Success", "Container updated successfully!");
      } else {
        await pb.collection("containers").create(data);
        Alert.alert("Success", "Container created successfully!");
      }

      onSave();
      onOpenChange(false);
      setSaving(false);
    } catch (error: any) {
      console.error("Error saving container:", error);
      Alert.alert("Error", error.message || "Failed to save container.");
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{container ? "Edit Container" : "Add New Container"}</DialogTitle>
        </DialogHeader>
        <View className="gap-4 mt-4">
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
              onPress={() => onOpenChange(false)}
              disabled={saving}
            >
              <Text>Cancel</Text>
            </Button>
            <Button className="flex-1" onPress={handleSave} disabled={saving}>
              <Text>{saving ? "Saving..." : "Save"}</Text>
            </Button>
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
}
