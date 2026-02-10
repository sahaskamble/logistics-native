import { Stack } from "expo-router";

export default function ContainerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
