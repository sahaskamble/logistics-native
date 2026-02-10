import { View } from "react-native";
import { ActiveFleetHeader } from "./ActiveFleetHeader";
import { FleetSearchBar } from "./FleetSearchBar";
import { StatusFilterTabs } from "./StatusFilterTabs";
import { ContainerList } from "./ContainerList";
import type { ContainerRecord, StatusTabKey } from "./types";

export interface ActiveFleetSectionProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  statusTab: StatusTabKey;
  onStatusTabChange: (key: StatusTabKey) => void;
  containers: ContainerRecord[];
  onOptionsPress: (container: ContainerRecord) => void;
  onFilterPress?: () => void;
}

export function ActiveFleetSection({
  searchQuery,
  onSearchChange,
  statusTab,
  onStatusTabChange,
  containers,
  onOptionsPress,
  onFilterPress,
}: ActiveFleetSectionProps) {
  return (
    <View>
      <ActiveFleetHeader onFilterPress={onFilterPress} />

      <FleetSearchBar
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Search ID or Type..."
      />

      <View className="mt-3 mb-4">
        <StatusFilterTabs selected={statusTab} onSelect={onStatusTabChange} />
      </View>

      <ContainerList
        containers={containers}
        hasActiveFilter={statusTab !== "All"}
        onOptionsPress={onOptionsPress}
      />
    </View>
  );
}
