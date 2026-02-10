import { View } from "react-native";
import { Text } from "@/components/ui/text";

export interface FleetProgressBarProps {
  /** 0–100 */
  percent?: number;
}

export function FleetProgressBar({ percent = 0 }: FleetProgressBarProps) {
  const value = Math.min(100, Math.max(0, percent));
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${value}%` }}
        />
      </View>
      <Text className="text-xs font-medium text-muted-foreground w-8 text-right">
        {Math.round(value)}%
      </Text>
    </View>
  );
}
