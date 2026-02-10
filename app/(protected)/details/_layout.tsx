import { Stack } from "expo-router";

export default function DetailsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="[providerId]"
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

