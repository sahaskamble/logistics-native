import { ScrollView, View, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  Package,
  Receipt,
  Container,
  Truck,
  Warehouse,
  ArrowRight,
} from "lucide-react-native";

const sections = [
  {
    id: "order",
    title: "Orders",
    description: "Create and manage 3PL orders",
    icon: Package,
    route: "/(protected)/orders/3pl/order",
    color: "bg-purple-500",
  },
  {
    id: "pricing-request",
    title: "Pricing Request",
    description: "Request pricing for 3PL services",
    icon: Receipt,
    route: "/(protected)/orders/3pl/pricing-request",
    color: "bg-purple-600",
  },
  {
    id: "cfs",
    title: "CFS",
    description: "Container Freight Station – orders, pricing, track & trace, EIR, and more",
    icon: Container,
    route: "/(protected)/orders/3pl/cfs",
    color: "bg-blue-500",
  },
  {
    id: "transport",
    title: "Transport",
    description: "Transport orders, movement, pricing, and service requests",
    icon: Truck,
    route: "/(protected)/orders/3pl/transport",
    color: "bg-green-500",
  },
  {
    id: "warehouse",
    title: "Warehouse",
    description: "Warehouse orders, pricing, track & trace, and services",
    icon: Warehouse,
    route: "/(protected)/orders/3pl/warehouse",
    color: "bg-orange-500",
  },
];

export default function ThreePlHubPage() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "3PL" }} />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <View className="mb-2">
            <Text className="text-2xl font-semibold">3PL Services</Text>
            <Text className="text-muted-foreground">
              Orders, pricing, CFS, Transport, and Warehouse under one place.
            </Text>
          </View>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              onPress={() => router.push(section.route as any)}
              activeOpacity={0.7}
            >
              <Card>
                <CardHeader className="flex-row items-center gap-3">
                  <View className={`${section.color} rounded-full p-3`}>
                    <Icon as={section.icon} size={24} className="text-white" />
                  </View>
                  <View className="flex-1">
                    <CardTitle>{section.title}</CardTitle>
                    <Text className="text-sm text-muted-foreground mt-0.5">
                      {section.description}
                    </Text>
                  </View>
                  <Icon as={ArrowRight} size={20} className="text-muted-foreground" />
                </CardHeader>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );
}
