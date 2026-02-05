import { ActivityIndicator, View } from "react-native";
import { Text } from "./ui/text";

export default function LoadingView({ LoadingText }: { LoadingText: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="mt-4 text-muted-foreground">{LoadingText}</Text>
    </View>
  )
}

