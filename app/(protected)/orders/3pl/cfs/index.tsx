import { ScrollView, View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import {
  ArrowDown,
  Boxes,
  Container,
  File,
  FileText,
  Grid2x2,
  MapPin,
  Play,
  Receipt,
  ReceiptIndianRupee,
  Scan,
  Scale,
  ScrollText,
} from "lucide-react-native";

const items = [
  { label: "Orders", route: "/(protected)/cfs/order", icon: Container },
  { label: "Pricing Request", route: "/(protected)/cfs/pricing-request", icon: Receipt },
  { label: "Track & Trace", route: "/(protected)/cfs/track-trace", icon: MapPin },
  { label: "EIR Copy Request", route: "/(protected)/cfs/eir-copy", icon: FileText },
  { label: "Proforma Invoice", route: "/(protected)/cfs/proforma-invoice", icon: File },
  { label: "Priority Movements", route: "/(protected)/cfs/priority-movements", icon: Play },
  { label: "Weighment Slip", route: "/(protected)/cfs/weighment-slip", icon: Scale },
  { label: "Special Equipment", route: "/(protected)/cfs/special-equipment", icon: Grid2x2 },
  { label: "Container Grounding", route: "/(protected)/cfs/container-grounding", icon: ArrowDown },
  { label: "Container Staging", route: "/(protected)/cfs/container-staging", icon: Boxes },
  { label: "Re-Scanning", route: "/(protected)/cfs/re-scanning", icon: Scan },
  { label: "Tax Invoice", route: "/(protected)/cfs/tax-invoice", icon: Receipt },
  { label: "Tariff Request", route: "/(protected)/cfs/tariff-request", icon: ScrollText },
  { label: "One Time Tariff", route: "/(protected)/cfs/one-time-tariff", icon: FileText },
  { label: "Cheque Acceptance", route: "/(protected)/cfs/cheque-acceptance", icon: ReceiptIndianRupee },
];

export default function ThreePlCfsIndexPage() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "3PL • CFS" }} />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-3">
          <Text className="text-muted-foreground">
            CFS services inside 3PL (uses the same records as CFS).
          </Text>
          {items.map((item) => (
            <Pressable key={item.route} onPress={() => router.push(item.route as any)}>
              <Card className="active:opacity-90">
                <CardHeader className="flex-row items-center gap-3">
                  <View className="bg-blue-500/10 rounded-full p-2">
                    <Icon as={item.icon} size={22} className="text-blue-500" />
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

