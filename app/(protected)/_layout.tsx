import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tabs, useRouter } from "expo-router";
import { Container, Home, LayoutDashboardIcon, Plus, UserCircle } from "lucide-react-native";
import { Alert, Text, View } from "react-native";

function CustomTabBar() {
  const router = useRouter()
  const handleClick = () => {
    router.push('/(protected)/sheet')
    Alert.alert(
      "This is a Test",
      "a testing message",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Clicked"),
          style: 'cancel',
        },
        {
          text: "Ok",
          onPress: () => console.log("Ok Clicked"),
          style: 'destructive',
        }
      ],
    )
  }

  return (
    <View className="items-center">
      <Button
        size={"icon"}
        variant={"default"}
        className="rounded-full w-16 h-16 absolute -top-[40px]"
        onPress={handleClick}
      >
        <Icon as={Plus} size={40} className="text-white" />
      </Button>
    </View>
  )
}

export default function ProtectedLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: "blue",
        tabBarStyle: {
          height: 65,
          paddingTop: 10,
        },
        headerRight: () => (
          <View className="px-2">
            <ThemeToggle />
          </View>
        ),
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              as={Home}
              size={focused ? 35 : 30}
              className={`${focused ? "text-primary" : "text-gray-400"} transition-colors`}
            />
          ),
          headerTitle: () => <Text className="text-2xl dark:text-foreground">Home</Text>,
          tabBarLabel: "Home",
          tabBarLabelStyle: { fontSize: 12 }
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              as={LayoutDashboardIcon}
              size={focused ? 35 : 30}
              className={`${focused ? "text-primary" : "text-gray-400"} transition-colors`}
            />
          ),
          headerTitle: () => <Text className="text-2xl dark:text-foreground">Dashboard</Text>,
          tabBarLabel: "Dashboard",
          tabBarLabelStyle: { fontSize: 12 }
        }}
      />

      < Tabs.Screen
        name="custom"
        options={{
          tabBarButton: CustomTabBar,
        }}
      />

      < Tabs.Screen
        name="container"
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              as={Container}
              size={focused ? 35 : 30}
              className={`${focused ? "text-primary" : "text-gray-400"} transition-colors`}
            />
          ),
          headerTitle: () => <Text className="text-2xl dark:text-foreground">Chat & Support</Text>,
          tabBarLabel: "Help & Support",
          tabBarLabelStyle: { fontSize: 12 }
        }}
      />

      < Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              as={UserCircle}
              size={focused ? 35 : 30}
              className={`${focused ? "text-primary" : "text-gray-400"} transition-colors`}
            />
          ),
          headerTitle: () => <Text className="text-2xl dark:text-foreground">Profile</Text>,
          tabBarLabel: "Profile",
          tabBarLabelStyle: { fontSize: 12 }
        }}
      />

      <Tabs.Screen
        name="sheet"
        options={{
          href: null,
        }}
      />
    </Tabs >
  )
}

