import ThemeToggle from "@/components/ThemeToggle";
import { Stack } from "expo-router";
import { Image, View } from "react-native";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{
      title: "",
      headerTransparent: true,
      headerLeft: () => (
        <View className="w-full justify-start mt-1">
          <Image
            source={require('@/assets/images/logo.png')}
            alt="Logo"
            className="w-[65%] h-8 object-contain mt-2"
          />
        </View>
      ),
    }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  )
}

