import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Filter } from "lucide-react-native";

export interface ActiveFleetHeaderProps {
  onFilterPress?: () => void;
}

export function ActiveFleetHeader({ onFilterPress }: ActiveFleetHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-lg font-bold text-foreground">Active Fleet</Text>
      <Pressable
        onPress={onFilterPress}
        className="flex-row items-center gap-2 bg-card border border-border rounded-lg px-3 py-2"
      >
        <Icon as={Filter} size={18} className="text-primary" />
        <Text className="text-sm font-medium text-foreground">Filter</Text>
      </Pressable>
    </View>
  );
}
