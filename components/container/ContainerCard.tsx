import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Package, MapPin, Calendar, MoreVertical, ArrowRight } from "lucide-react-native";
import { StatusTag } from "./StatusTag";
import { FleetProgressBar } from "./FleetProgressBar";
import {
  formatAddedDate,
  getDimensionsLabel,
  getLocationLabel,
} from "./types";
import type { ContainerRecord } from "./types";

export interface ContainerCardProps {
  container: ContainerRecord;
  /** Optional progress 0–100 for Busy containers */
  progressPercent?: number;
  onOptionsPress: (container: ContainerRecord) => void;
}

export function ContainerCard({
  container,
  progressPercent = 75,
  onOptionsPress,
}: ContainerCardProps) {
  const isBusy = container.status === "Busy";
  const dimensionsLabel = getDimensionsLabel(container.size);
  const locationLabel = getLocationLabel(container.status);

  return (
    <Card className="mb-3 p-2.5 py-3 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Top row: icon + ID (left), status tag + options (right) */}
        <View className="flex-row items-center justify-between gap-2 mb-1.5 px-1">
          <View className="flex-row items-center gap-2.5 flex-1 min-w-0">
            <View className="bg-muted/70 rounded-lg w-11 h-11 bg-blue-100 items-center justify-center">
              <Icon as={Package} size={25} className="text-primary" />
            </View>
            <Text
              className="text-base font-bold text-foreground flex-1"
              numberOfLines={1}
            >
              {container.containerNo || "N/A"}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <StatusTag status={container.status} />
            <Pressable
              onPress={() => onOptionsPress(container)}
              className="p-1.5 -m-1.5 bg-blue-100 mx-2 rounded-lg"
            >
              <Icon as={ArrowRight} size={20} className="text-primary" />
            </Pressable>
          </View>
        </View>

        {/* Location row */}
        <View className="flex-row items-center gap-1.5 mb-2 px-2">
          <Icon as={MapPin} size={12} className="text-muted-foreground" />
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {locationLabel}
          </Text>
        </View>

        {/* Progress bar for Busy */}
        {isBusy && (
          <View className="mb-2 px-2">
            <FleetProgressBar percent={progressPercent} />
          </View>
        )}

        {/* Dimensions | Cargo Type */}
        <View className="flex-row gap-4 mb-2 px-2">
          <View className="flex-1">
            <Text className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Dimensions
            </Text>
            <Text className="text-sm font-semibold text-foreground">
              {dimensionsLabel}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Cargo Type
            </Text>
            <Text
              className="text-sm font-semibold text-foreground"
              numberOfLines={1}
            >
              {container.cargoType || "—"}
            </Text>
          </View>
        </View>

        {/* Footer: Added date */}
        <View className="flex-row items-center gap-1.5 px-2">
          <Icon as={Calendar} size={12} className="text-muted-foreground" />
          <Text className="text-[11px] text-muted-foreground">
            Added {formatAddedDate(container.created)}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}
