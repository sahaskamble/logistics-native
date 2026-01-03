import { useState, useEffect } from "react";
import { ScrollView, View, Alert, RefreshControl } from "react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from "@/components/ui/select";
import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import LoadingView from "@/components/LoadingView";
import { Icon } from "@/components/ui/icon";
import { Package, Plus, Edit2, Trash2, Box, Activity, CheckCircle, XCircle } from "lucide-react-native";

type ContainersStatus =
  | "Good"
  | "Empty"
  | "Loading"
  | "Loaded"
  | "Damaged"
  | "Missing"
  | "Broken"
  | "COR"
  | "Free"
  | "Busy";

type ContainerRecord = {
  id: string;
  created?: string;
  containerNo?: string;
  size?: string;
  status?: ContainersStatus;
  cargoType?: string;
  ownedBy?: string;
};

const statusOptions: Option[] = [
  { value: "Good", label: "Good" },
  { value: "Empty", label: "Empty" },
  { value: "Loading", label: "Loading" },
  { value: "Loaded", label: "Loaded" },
  { value: "Damaged", label: "Damaged" },
  { value: "Missing", label: "Missing" },
  { value: "Broken", label: "Broken" },
  { value: "COR", label: "COR" },
  { value: "Free", label: "Free" },
  { value: "Busy", label: "Busy" },
];

const sizeOptions: Option[] = [
  { value: "20ft", label: "20ft" },
  { value: "40ft", label: "40ft" },
  { value: "45ft", label: "45ft" },
];

interface ContainerStats {
  total: number;
  busy: number;
  free: number;
  good: number;
  damaged: number;
  loading: number;
  loaded: number;
}

function ContainerCard({
  container,
  onEdit,
  onDelete,
}: {
  container: ContainerRecord;
  onEdit: (container: ContainerRecord) => void;
  onDelete: (containerId: string) => void;
}) {
  const getStatusColor = (status?: ContainersStatus) => {
    switch (status) {
      case "Busy":
        return "bg-blue-500";
      case "Free":
        return "bg-green-500";
      case "Good":
        return "bg-emerald-500";
      case "Damaged":
      case "Broken":
        return "bg-red-500";
      case "Loading":
        return "bg-yellow-500";
      case "Loaded":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-2">
              <Icon as={Package} size={24} className="text-primary" />
              <Text className="text-lg font-semibold">{container.containerNo || "N/A"}</Text>
            </View>
            {container.status && (
              <Badge className={`${getStatusColor(container.status)} w-1/2 mb-2`}>
                <Text className="text-white text-lg">{container.status}</Text>
              </Badge>
            )}
          </View>
          <View className="flex-row gap-2">
            <Button
              variant="outline"
              size="icon"
              onPress={() => onEdit(container)}
            >
              <Icon as={Edit2} size={18} />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onPress={() => onDelete(container.id)}
            >
              <Icon as={Trash2} size={18} color="#fff" />
            </Button>
          </View>
        </View>

        <View className="gap-2">
          {container.size && (
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-muted-foreground">Size:</Text>
              <Text className="text-sm font-medium">{container.size}</Text>
            </View>
          )}
          {container.cargoType && (
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-muted-foreground">Cargo Type:</Text>
              <Text className="text-sm font-medium">{container.cargoType}</Text>
            </View>
          )}
          <View className="flex-row items-center gap-2">
            <Text className="text-sm text-muted-foreground">Created:</Text>
            <Text className="text-sm font-medium">
              {container.created
                ? new Date(container.created).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
                : "N/A"}
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

function ContainerDialog({
  container,
  open,
  onOpenChange,
  onSave,
}: {
  container: ContainerRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
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

      const data: any = {
        containerNo: formData.containerNo.trim(),
        size: formData.size?.value || undefined,
        status: (formData.status?.value as ContainersStatus) || undefined,
        cargoType: formData.cargoType.trim() || undefined,
        ownedBy: user.user.id,
      };

      if (container) {
        // Update existing container
        await pb.collection("containers").update(container.id, data);
        Alert.alert("Success", "Container updated successfully!");
      } else {
        // Create new container
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
              onValueChange={(value: Option) => {
                setFormData((prev) => ({ ...prev, size: value }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {sizeOptions.map((size) => {
                  if (!size?.value || !size?.label) return null;
                  return (
                    <SelectItem key={size.value} value={size.value} label={size.label}>
                      {size.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </View>

          <View className="gap-2">
            <Label>Status</Label>
            <Select
              value={formData.status || undefined}
              onValueChange={(value: Option) => {
                setFormData((prev) => ({ ...prev, status: value }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => {
                  if (!status?.value || !status?.label) return null;
                  return (
                    <SelectItem key={status.value} value={status.value} label={status.label}>
                      {status.label}
                    </SelectItem>
                  );
                })}
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
            <Button
              className="flex-1"
              onPress={handleSave}
              disabled={saving}
            >
              <Text>{saving ? "Saving..." : "Save"}</Text>
            </Button>
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
}

export default function ContainerManagementPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [containers, setContainers] = useState<ContainerRecord[]>([]);
  const [stats, setStats] = useState<ContainerStats>({
    total: 0,
    busy: 0,
    free: 0,
    good: 0,
    damaged: 0,
    loading: 0,
    loaded: 0,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<ContainerRecord | null>(null);

  useEffect(() => {
    fetchContainers();
  }, []);

  const fetchContainers = async () => {
    try {
      const user = getCurrentUser();
      if (!user.isValid || !user.user?.id) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const containersList = await pb.collection("containers").getFullList<ContainerRecord>({
        filter: `ownedBy="${user.user.id}"`,
        sort: "-created",
      });

      setContainers(containersList);

      // Calculate statistics
      const newStats: ContainerStats = {
        total: containersList.length,
        busy: containersList.filter((c) => c.status === "Busy").length,
        free: containersList.filter((c) => c.status === "Free").length,
        good: containersList.filter((c) => c.status === "Good").length,
        damaged: containersList.filter((c) => c.status === "Damaged" || c.status === "Broken").length,
        loading: containersList.filter((c) => c.status === "Loading").length,
        loaded: containersList.filter((c) => c.status === "Loaded").length,
      };

      setStats(newStats);
      setLoading(false);
      setRefreshing(false);
    } catch (error: any) {
      console.error("Error fetching containers:", error);
      Alert.alert("Error", "Failed to load containers.");
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEdit = (container: ContainerRecord) => {
    setEditingContainer(container);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingContainer(null);
    setDialogOpen(true);
  };

  const handleDelete = (containerId: string) => {
    Alert.alert(
      "Delete Container",
      "Are you sure you want to delete this container? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await pb.collection("containers").delete(containerId);
              Alert.alert("Success", "Container deleted successfully!");
              fetchContainers();
            } catch (error: any) {
              console.error("Error deleting container:", error);
              Alert.alert("Error", error.message || "Failed to delete container.");
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchContainers();
  };

  if (loading) {
    return <LoadingView LoadingText="Loading containers..." />;
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="p-4 gap-4">
        {/* Statistics Cards */}
        <View className="flex-row flex-wrap gap-3">
          <Card className="flex-1 min-w-[150px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Containers</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row items-center gap-2">
                <Icon as={Box} size={24} className="text-primary" />
                <Text className="text-2xl font-bold">{stats.total}</Text>
              </View>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[150px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Busy</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row items-center gap-2">
                <Icon as={Activity} size={24} className="text-blue-500" />
                <Text className="text-2xl font-bold">{stats.busy}</Text>
              </View>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[150px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Free</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row items-center gap-2">
                <Icon as={CheckCircle} size={24} className="text-green-500" />
                <Text className="text-2xl font-bold">{stats.free}</Text>
              </View>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[150px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Good</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row items-center gap-2">
                <Icon as={CheckCircle} size={24} className="text-emerald-500" />
                <Text className="text-2xl font-bold">{stats.good}</Text>
              </View>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[150px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Damaged</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row items-center gap-2">
                <Icon as={XCircle} size={24} className="text-red-500" />
                <Text className="text-2xl font-bold">{stats.damaged}</Text>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Add Container Button */}
        <Button onPress={handleAdd} className="w-full">
          <Icon as={Plus} size={20} className="mr-2" />
          <Text>Add New Container</Text>
        </Button>

        {/* Containers List */}
        <View>
          <Text className="text-xl font-semibold mb-3">My Containers</Text>
          {containers.length === 0 ? (
            <Card>
              <CardContent className="items-center py-12">
                <Icon as={Box} size={48} className="text-muted-foreground mb-2" />
                <Text className="text-muted-foreground text-center">No containers found</Text>
                <Text className="text-muted-foreground text-sm text-center mt-1">
                  Add your first container to get started
                </Text>
              </CardContent>
            </Card>
          ) : (
            containers.map((container) => (
              <ContainerCard
                key={container.id}
                container={container}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </View>
      </View>

      {/* Edit/Add Dialog */}
      <ContainerDialog
        container={editingContainer}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={fetchContainers}
      />
    </ScrollView>
  );
}
