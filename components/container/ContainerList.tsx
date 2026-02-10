import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Box } from "lucide-react-native";
import { ContainerCard } from "./ContainerCard";
import type { ContainerRecord } from "./types";

export interface ContainerListProps {
  containers: ContainerRecord[];
  emptyMessage?: string;
  emptyFilterMessage?: string;
  hasActiveFilter: boolean;
  onOptionsPress: (container: ContainerRecord) => void;
}

export function ContainerList({
  containers,
  emptyMessage = "No containers. Add your first to get started.",
  emptyFilterMessage = "No containers match the current filter.",
  hasActiveFilter,
  onOptionsPress,
}: ContainerListProps) {
  if (containers.length === 0) {
    return (
      <Card className="rounded-xl border border-border">
        <CardContent className="items-center py-12">
          <Icon as={Box} size={44} className="text-muted-foreground mb-3" />
          <Text className="text-muted-foreground text-sm text-center px-4">
            {hasActiveFilter ? emptyFilterMessage : emptyMessage}
          </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <View>
      {containers.map((container) => (
        <ContainerCard
          key={container.id}
          container={container}
          progressPercent={container.status === "Busy" ? 75 : undefined}
          onOptionsPress={onOptionsPress}
        />
      ))}
    </View>
  );
}
