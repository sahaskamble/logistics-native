import { View } from "react-native";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Search } from "lucide-react-native";

export interface FleetSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function FleetSearchBar({
  value,
  onChangeText,
  placeholder = "Search ID or Type...",
}: FleetSearchBarProps) {
  return (
    <View className="flex-row items-center gap-2 bg-muted/30 rounded-xl border border-border px-3 py-1.5">
      <Icon as={Search} size={18} className="text-muted-foreground" />
      <Input
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        className="flex-1 border-0 bg-transparent shadow-none text-sm min-h-0 py-0"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
