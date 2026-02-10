import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { STATUS_TABS } from "./types";
import type { StatusTabKey } from "./types";

export interface StatusFilterTabsProps {
  selected: StatusTabKey;
  onSelect: (key: StatusTabKey) => void;
}

export function StatusFilterTabs({ selected, onSelect }: StatusFilterTabsProps) {
  return (
    <View className="flex-row gap-2">
      {STATUS_TABS.map((tab) => {
        const isSelected = selected === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            className={`rounded-lg px-4 py-2.5 ${isSelected ? "bg-primary" : "bg-card border border-border"}`}
          >
            <Text
              className={`text-sm font-medium ${isSelected ? "text-primary-foreground" : "text-foreground"}`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
