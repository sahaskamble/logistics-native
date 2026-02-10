import { useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "expo-router";
import { Container, Truck, Boxes, Warehouse, Package, ArrowRight } from "lucide-react-native";

interface ServiceOption {
  id: string;
  title: string;
  description: string;
  icon: typeof Container;
  route: string;
  color: string;
}

const serviceOptions: ServiceOption[] = [
  {
    id: "cfs",
    title: "CFS",
    description: "Container Freight Station services for cargo handling and storage",
    icon: Container,
    route: "/(protected)/cfs/order/create",
    color: "bg-blue-500",
  },
  {
    id: "transport",
    title: "Transport",
    description: "Transportation and logistics services for goods movement",
    icon: Truck,
    route: "/(protected)/orders/transport/create",
    color: "bg-green-500",
  },
  {
    id: "3pl",
    title: "3PL",
    description: "Third-party logistics services for comprehensive supply chain management",
    icon: Boxes,
    route: "/(protected)/orders/3pl/create",
    color: "bg-purple-500",
  },
  {
    id: "warehouse",
    title: "Warehouse",
    description: "Warehousing services for inventory management and storage",
    icon: Warehouse,
    route: "/(protected)/orders/warehouse/create",
    color: "bg-orange-500",
  },
  {
    id: "custom",
    title: "Custom",
    description: "Custom order packages tailored to your specific requirements",
    icon: Package,
    route: "/(protected)/orders/custom/select",
    color: "bg-pink-500",
  },
];

export default function OrderServiceSelectionPage() {
  const router = useRouter();

  const handleServiceSelect = (service: string) => {
    // Navigate to the service drawer
    router.push(`${service}` as any);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        <View className="mb-2">
          <Text className="text-2xl font-semibold mb-1">Create New Order</Text>
          <Text className="text-muted-foreground">
            Select a service type to create your order
          </Text>
        </View>

        <View className="gap-4">
          {serviceOptions.map((service) => (
            <TouchableOpacity
              key={service.id}
              onPress={() => handleServiceSelect(service.route)}
              activeOpacity={0.7}
            >
              <Card className="border-2 border-border hover:border-primary transition-colors py-2">
                <CardContent className="px-4">
                  <View className="flex-row items-center gap-4">
                    {/* Icon */}
                    <View className={`${service.color} rounded-full p-3`}>
                      <Icon
                        as={service.icon}
                        size={30}
                        className="text-white"
                      />
                    </View>

                    {/* Content */}
                    <View className="flex-1 gap-1">
                      <CardTitle className="text-lg mb-1">{service.title}</CardTitle>
                    </View>

                    {/* Arrow */}
                    <Icon
                      as={ArrowRight}
                      size={24}
                      className="text-muted-foreground"
                    />
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Card */}
        <Card className="mt-4 bg-muted/50">
          <CardContent className="p-4">
            <Text className="text-sm text-muted-foreground text-center">
              Choose the service type that best matches your logistics needs.
              You can create multiple orders for different services.
            </Text>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}

