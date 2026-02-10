import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { OverviewSummaryCard } from "./OverviewSummaryCard";
import { Settings, Zap, CheckCircle } from "lucide-react-native";
import type { ContainerStats } from "./types";

export interface OverviewSectionProps {
  stats: ContainerStats;
  onViewReport?: () => void;
}

export function OverviewSection({ stats, onViewReport }: OverviewSectionProps) {
  return (
    <View>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Overview
        </Text>
      </View>
      <View className="flex-row gap-2">
        <OverviewSummaryCard
          icon={Settings}
          value={stats.total}
          label="Total Units"
          iconClassName="text-primary"
        />
        <OverviewSummaryCard
          icon={Zap}
          value={stats.busy}
          label="In Transit"
          iconClassName="text-yellow-600"
        />
        <OverviewSummaryCard
          icon={CheckCircle}
          value={stats.free}
          label="Available"
          iconClassName="text-green-600"
        />
      </View>
    </View>
  );
}
