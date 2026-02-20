import { Stack } from "expo-router";

export default function SupportLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Support Tickets" }} />
      <Stack.Screen name="create" options={{ title: "New Ticket" }} />
      <Stack.Screen name="[ticketId]" options={{ title: "Ticket" }} />
    </Stack>
  );
}
