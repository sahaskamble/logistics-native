import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { getStatusDisplay } from "./types";
import type { ContainersStatus } from "./types";

export interface StatusTagProps {
  status?: ContainersStatus;
}

export function StatusTag({ status }: StatusTagProps) {
  const display = getStatusDisplay(status);
  if (!display) return null;

  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-md px-2 py-1 ${display.bgClass}`}
    >
      <View className={`w-1.5 h-1.5 rounded-full ${display.dotClass}`} />
      <Text className={`text-[10px] font-bold uppercase ${display.textClass}`}>
        {display.label}
      </Text>
    </View>
  );
}
