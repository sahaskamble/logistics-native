import { Stack } from "expo-router";

export default function PricingRequestLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="[providerId]" />
    </Stack>
  );
}

