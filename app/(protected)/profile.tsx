import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import pb from "@/lib/pocketbase/pb";
import { View } from "react-native";

export default function ProfilePage() {
  function handleLogout() {
    pb.authStore.clear();
  }
  return (
    <View className="flex-1 justify-center items-center">
      <Text>Profile</Text>
      <Button
        onPress={handleLogout}
      >
        <Text className="text-background">Logout</Text>
      </Button>
    </View>
  )
}

