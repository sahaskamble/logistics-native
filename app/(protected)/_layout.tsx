import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tabs, useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Container,
  Home,
  LayoutDashboardIcon,
  Menu,
  UserCircle,
  Package,
  FileText,
  DollarSign,
  Wrench,
  Truck,
  Boxes,
  Warehouse,
  ShoppingBag,
  Plus,
} from "lucide-react-native";
import { Alert, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useState, useEffect, Fragment } from "react";
import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "react-native-drawer-layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function CustomTabBar() {
  const router = useRouter()
  const handleClick = () => {
    router.push({
      pathname: "/(protected)/custom",
    } as any);
  }

  return (
    <View className="items-center">
      <Button
        size={"icon"}
        variant={"default"}
        className="rounded-full w-16 h-16 absolute -top-[25px]"
        onPress={handleClick}
      >
        <Icon as={Plus} size={40} className="text-white" />
      </Button>
    </View>
  )
}

function NotificationIcon() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  type Notification = {
    id: string;
    isRead?: boolean;
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const user = getCurrentUser();
        if (!user.isValid || !user.user?.id) {
          return;
        }

        // Filter by user if field exists, otherwise use createdFor
        let filter = `createdFor="Customer" && status="Active" && isRead=false`;

        // Try to use user field if it exists
        try {
          await pb.collection("notification").getList(1, 1, {
            filter: `user="${user.user.id}"`,
          });
          filter = `user="${user.user.id}" && status="Active" && isRead=false`;
        } catch {
          // Use createdFor as fallback
          filter = `createdFor="Customer" && status="Active" && isRead=false`;
        }

        pb.autoCancellation(false);
        const notifications = await pb.collection("notification").getFullList<Notification>({
          filter: filter,
          sort: "-created",
        });

        setUnreadCount(notifications.length);
      } catch (error) {
        console.error("Error fetching unread notifications:", error);
      }
    };

    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="relative mr-2">
      <Button
        variant="ghost"
        size="icon"
        onPress={() => router.push("/(protected)/notifications")}
        className="rounded-full"
      >
        <Icon as={Bell} size={24} className="text-foreground" />
      </Button>
      {unreadCount > 0 && (
        <View className="absolute -top-1 -right-1 bg-destructive rounded-full min-w-[20px] h-5 items-center justify-center px-1">
          <Text className="text-white text-xs font-bold">{unreadCount > 99 ? "99+" : unreadCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function ProtectedLayout() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const drawerItems = [
    {
      id: "cfs",
      title: "CFS",
      icon: Container,
      route: "/(protected)/orders/cfs",
      color: "bg-blue-500",
      items: [
        { label: "Orders", route: "/(protected)/orders/cfs", icon: Container },
        { label: "Create Order", route: "/(protected)/orders/cfs/new", icon: Package },
        { label: "EIR Copy Request", route: "/(protected)/orders/cfs/eir-copy", icon: FileText },
        { label: "Tariff Request", route: "/(protected)/orders/cfs/tariff", icon: DollarSign },
        { label: "Service Request", route: "/(protected)/orders/cfs/service-request", icon: Wrench },
      ],
    },
    {
      id: "transport",
      title: "Transport",
      icon: Truck,
      route: "/(protected)/orders/transport",
      color: "bg-green-500",
      items: [
        { label: "Create Order", route: "/(protected)/orders/transport", icon: Package },
        { label: "Service Request", route: "/(protected)/orders/transport/service-request", icon: Wrench },
      ],
    },
    {
      id: "3pl",
      title: "3PL",
      icon: Boxes,
      route: "/(protected)/orders/3pl",
      color: "bg-purple-500",
      items: [
        { label: "Create Order", route: "/(protected)/orders/3pl", icon: Package },
        { label: "Service Request", route: "/(protected)/orders/3pl/service-request", icon: Wrench },
      ],
    },
    {
      id: "warehouse",
      title: "Warehouse",
      icon: Warehouse,
      route: "/(protected)/orders/warehouse",
      color: "bg-orange-500",
      items: [
        { label: "Create Order", route: "/(protected)/orders/warehouse", icon: Package },
        { label: "Service Request", route: "/(protected)/orders/warehouse/service-request", icon: Wrench },
      ],
    },
    {
      id: "custom",
      title: "Custom",
      icon: ShoppingBag,
      route: "/(protected)/orders/custom",
      color: "bg-pink-500",
      items: [
        { label: "Select Package", route: "/(protected)/orders/custom/select", icon: Package },
        { label: "Service Request", route: "/(protected)/orders/custom/service-request", icon: Wrench },
      ],
    },
  ];

  return (
    <Drawer
      open={drawerOpen}
      onOpen={() => setDrawerOpen(true)}
      onClose={() => setDrawerOpen(false)}
      renderDrawerContent={() => (
        <Fragment>
          <View className="pt-12 p-4">
            <Text className="text-2xl font-bold mb-1">Orders & Services</Text>
            <Text className="text-sm text-muted-foreground">Select a service to get started</Text>
          </View>
          <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4">
            <Accordion type="multiple" className="gap-2">
              {drawerItems.map((service) => (
                <AccordionItem key={service.id} value={service.id} className="border-border border rounded-lg mb-2">
                  <AccordionTrigger className="px-4 py-3">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className={`${service.color} rounded-full p-2`}>
                        <Icon as={service.icon} size={20} className="text-white" />
                      </View>
                      <Text className="text-base font-semibold flex-1">{service.title}</Text>
                    </View>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-3">
                    <View className="gap-2">
                      {service.items.map((item) => (
                        <TouchableOpacity
                          key={item.route}
                          onPress={() => {
                            router.push(item.route as any);
                            setDrawerOpen(false);
                          }}
                          className="p-3 bg-muted/50 rounded-lg active:bg-muted"
                        >
                          <View className="flex-row items-center gap-3">
                            <Icon as={item.icon} size={18} className="text-muted-foreground" />
                            <Text className="text-sm font-medium flex-1">{item.label}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollView>
        </Fragment>
      )}
    >
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: "blue",
          tabBarStyle: {
            height: 65,
            paddingTop: 10,
          },
          headerRight: () => (
            <View className="flex-row items-center px-2">
              <NotificationIcon />
              <ThemeToggle />
            </View>
          ),
          headerLeft: () => (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => setDrawerOpen(true)}
              className="rounded-full mx-2"
            >
              <Icon as={Menu} size={24} />
            </Button>
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
          name="order"
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
            headerTitle: () => <Text className="text-2xl dark:text-foreground">CON-Management</Text>,
            tabBarLabel: "Container",
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
          name="details"
          options={{
            headerTitle: "Details",
            headerLeft: () => (
              <Button
                variant="ghost"
                size="icon"
                onPress={() => router.push('/home')}
                className="rounded-full mx-2"
              >
                <Icon as={ArrowLeft} size={24} />
              </Button>
            ),
            href: null,
          }}
        />

        <Tabs.Screen
          name="pricing-request"
          options={{
            headerTitle: "Pricing Request",
            headerLeft: () => (
              <Button
                variant="ghost"
                size="icon"
                onPress={() => router.push('/home')}
                className="rounded-full mx-2"
              >
                <Icon as={ArrowLeft} size={24} />
              </Button>
            ),
            href: null,
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            headerTitle: "Notifications",
            href: null,
          }}
        />

        <Tabs.Screen
          name="custom"
          options={{
            headerTitle: "Select Service",
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
            href: null,
          }}
        />

        <Tabs.Screen
          name="orders"
          options={{
            headerShown: false,
            href: null,
          }}
        />
      </Tabs>
    </Drawer>
  )
}
