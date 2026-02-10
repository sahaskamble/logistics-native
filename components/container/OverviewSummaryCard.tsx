import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { LucideIcon } from "lucide-react-native";

export interface OverviewSummaryCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  iconClassName?: string;
}

export function OverviewSummaryCard({
  icon,
  value,
  label,
  iconClassName = "text-primary",
}: OverviewSummaryCardProps) {
  return (
    <Card className="flex-1 rounded-xl border border-border bg-card shadow-sm min-w-0 py-1">
      <CardContent className="p-4">
        <View className="mb-2 w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
          <Icon as={icon} size={20} className={iconClassName} />
        </View>
        <Text className="text-2xl font-bold text-foreground">{value}</Text>
        <Text className="text-xs text-muted-foreground mt-0.5">{label}</Text>
      </CardContent>
    </Card>
  );
}
