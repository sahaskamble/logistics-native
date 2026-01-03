import { Stack } from "expo-router";

export default function ProviderPricingRequestLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="create" />
    </Stack>
  );
}

