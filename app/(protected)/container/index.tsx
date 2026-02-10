import { useState, useCallback } from "react";
import { ScrollView, View, Alert, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import LoadingView from "@/components/LoadingView";

import {
  OverviewSection,
  AddNewContainerButton,
  ActiveFleetSection,
  type ContainerRecord,
  type ContainerStats,
  type StatusTabKey,
} from "@/components/container";

export default function ContainerManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [containers, setContainers] = useState<ContainerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTabKey>("All");
  const [stats, setStats] = useState<ContainerStats>({
    total: 0,
    busy: 0,
    free: 0,
    good: 0,
    damaged: 0,
    loading: 0,
    loaded: 0,
  });
  const fetchContainers = async () => {
    try {
      const user = getCurrentUser();
      if (!user.isValid || !user.user?.id) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const list = await pb.collection("containers").getFullList<ContainerRecord>({
        filter: `ownedBy="${user.user.id}"`,
        sort: "-created",
      });

      setContainers(list);
      setStats({
        total: list.length,
        busy: list.filter((c) => c.status === "Busy").length,
        free: list.filter((c) => c.status === "Free").length,
        good: list.filter((c) => c.status === "Good").length,
        damaged: list.filter((c) => c.status === "Damaged" || c.status === "Broken").length,
        loading: list.filter((c) => c.status === "Loading").length,
        loaded: list.filter((c) => c.status === "Loaded").length,
      });
    } catch (error: any) {
      console.error("Error fetching containers:", error);
      Alert.alert("Error", "Failed to load containers.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchContainers();
    }, [])
  );

  const filteredContainers = containers.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const match =
        c.containerNo?.toLowerCase().includes(q) ||
        c.cargoType?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusTab === "All") return true;
    if (statusTab === "Busy") return c.status === "Busy";
    if (statusTab === "Free") return c.status === "Free";
    if (statusTab === "Maintenance")
      return c.status === "Damaged" || c.status === "Broken";
    return true;
  });

  const handleAdd = () => {
    router.push("/(protected)/container/create");
  };

  const handleEdit = (container: ContainerRecord) => {
    router.push(`/(protected)/container/edit/${container.id}`);
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
              Alert.alert("Error", error.message || "Failed to delete container.");
            }
          },
        },
      ]
    );
  };

  const showOptions = (container: ContainerRecord) => {
    Alert.alert(container.containerNo || "Container", undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Edit", onPress: () => handleEdit(container) },
      { text: "Delete", style: "destructive", onPress: () => handleDelete(container.id) },
    ]);
  };

  if (loading) {
    return <LoadingView LoadingText="Loading containers..." />;
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchContainers();
          }}
        />
      }
    >
      <View className="p-4 gap-5">
        <OverviewSection stats={stats} />

        <AddNewContainerButton onPress={handleAdd} />

        <ActiveFleetSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusTab={statusTab}
          onStatusTabChange={setStatusTab}
          containers={filteredContainers}
          onOptionsPress={showOptions}
        />
      </View>
    </ScrollView>
  );
}
