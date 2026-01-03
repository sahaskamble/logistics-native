import { Tabs } from "expo-router";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft, Box, FileText } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";

export default function CfsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: { display: 'none' },
        tabBarActiveTintColor: "blue",
        headerLeft: () => (
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.push("/(protected)/home")}
            className="rounded-full mx-2"
          >
            <Icon as={ArrowLeft} size={24} />
          </Button>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Orders",
        }}
      />
      <Tabs.Screen
        name="[action]"
        options={{
          headerTitle: "Create Order",
        }}
      />
      <Tabs.Screen
        name="[orderId]"
        options={{
          headerTitle: "Order Details",
          href: null,
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          headerTitle: "Create Order",
          href: null,
        }}
      />
      <Tabs.Screen
        name="eir-copy"
        options={{
          title: "EIR Copy Request",
        }}
      />
      <Tabs.Screen
        name="tariff"
        options={{
          title: "Tariff Request",
        }}
      />
      <Tabs.Screen
        name="service-request"
        options={{
          title: "Service Request",
        }}
      />
    </Tabs>
  );
}
