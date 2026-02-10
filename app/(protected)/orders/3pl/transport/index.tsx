import { ScrollView, View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { MapPin, Package, Receipt, Wrench } from "lucide-react-native";

const items = [
  { label: "Orders", route: "/(protected)/transport/order", icon: Package },
  { label: "Order Movement", route: "/(protected)/transport/order-movement", icon: MapPin },
  { label: "Pricing Request", route: "/(protected)/transport/pricing-request", icon: Receipt },
  { label: "Service Request", route: "/(protected)/transport/service-requests", icon: Wrench },
];

export default function ThreePlTransportIndexPage() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "3PL • Transport" }} />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-3">
          <Text className="text-muted-foreground">
            Transport services inside 3PL (uses the same records as Transport).
          </Text>
          {items.map((item) => (
            <Pressable key={item.route} onPress={() => router.push(item.route as any)}>
              <Card className="active:opacity-90">
                <CardHeader className="flex-row items-center gap-3">
                  <View className="bg-green-500/10 rounded-full p-2">
                    <Icon as={item.icon} size={22} className="text-green-500" />
                  </View>
                  <View className="flex-1">
                    <CardTitle>{item.label}</CardTitle>
                  </View>
                </CardHeader>
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

