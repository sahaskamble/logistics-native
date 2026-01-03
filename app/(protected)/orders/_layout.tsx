import { Stack } from "expo-router";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";

export default function OrdersLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => (
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
            className="rounded-full mx-2"
          >
            <Icon as={ArrowLeft} size={24} />
          </Button>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Select Service",
        }}
      />
      <Stack.Screen
        name="cfs"
        options={{
          headerShown: false,
        }}
      />
      {/* <Stack.Screen
        name="transport"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="3pl"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="warehouse"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="custom"
        options={{
          headerShown: false,
        }}
      /> */}
    </Stack>
  );
}

