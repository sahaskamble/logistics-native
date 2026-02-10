import { ScrollView, View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import {
  ArrowDown,
  Boxes,
  FileText,
  Grid2x2,
  MapPin,
  Package,
  Play,
  Receipt,
  ReceiptIndianRupee,
  Scan,
  Scale,
} from "lucide-react-native";

const items = [
  { label: "Orders", route: "/(protected)/warehouse/order", icon: Package },
  { label: "Pricing Request", route: "/(protected)/warehouse/pricing-request", icon: Receipt },
  { label: "Track & Trace", route: "/(protected)/warehouse/track-trace", icon: MapPin },
  { label: "EIR Copy", route: "/(protected)/warehouse/eir-copy", icon: FileText },
  { label: "Priority Movements", route: "/(protected)/warehouse/priority-movements", icon: Play },
  { label: "Weighment Slip", route: "/(protected)/warehouse/weighment-slip", icon: Scale },
  { label: "Special Equipment", route: "/(protected)/warehouse/special-equipment", icon: Grid2x2 },
  { label: "Container Staging", route: "/(protected)/warehouse/container-staging", icon: Boxes },
  { label: "Container Grounding", route: "/(protected)/warehouse/container-grounding", icon: ArrowDown },
  { label: "Re-Scanning", route: "/(protected)/warehouse/re-scanning", icon: Scan },
  { label: "Tax Invoice", route: "/(protected)/warehouse/tax-invoice", icon: ReceiptIndianRupee },
];

export default function ThreePlWarehouseIndexPage() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "3PL • Warehouse" }} />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-3">
          <Text className="text-muted-foreground">
            Warehouse services inside 3PL (uses the same records as Warehouse).
          </Text>
          {items.map((item) => (
            <Pressable key={item.route} onPress={() => router.push(item.route as any)}>
              <Card className="active:opacity-90">
                <CardHeader className="flex-row items-center gap-3">
                  <View className="bg-orange-500/10 rounded-full p-2">
                    <Icon as={item.icon} size={22} className="text-orange-500" />
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

