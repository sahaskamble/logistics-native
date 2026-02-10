import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Tabs, usePathname, useRouter } from "expo-router";
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
  Wrench,
  Truck,
  Boxes,
  Warehouse,
  ShoppingBag,
  Plus,
  Receipt,
  MapPin,
  File,
  Play,
  Scale,
  Grid2x2,
  ArrowDown,
  Scan,
  ScrollText,
  ReceiptIndianRupee,
} from "lucide-react-native";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { createContext, useContext, useState, useEffect, useCallback, Fragment } from "react";
import { Drawer } from "react-native-drawer-layout";

const DrawerControlContext = createContext<{ openDrawer: () => void }>({ openDrawer: () => { } });
export function useDrawerControl() {
  return useContext(DrawerControlContext);
}
import pb from "@/lib/pocketbase/pb";
import { getUnreadNotificationsCountForCurrentUser } from "@/lib/actions/notifications/notification";
import { preload as preloadNotifications } from "@/lib/notifications/notificationCache";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
        className="rounded-full w-16 h-16 absolute -top-[25px] shadow-md shadow-gray-500"
        onPress={handleClick}
      >
        <Icon as={Plus} size={40} className="text-white" />
      </Button>
    </View>
  )
}

function NotificationIcon() {
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadNotificationsCountForCurrentUser();
      setUnreadCount(res.success ? (res.output ?? 0) : 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  // Refetch when user navigates (e.g. after creating order, or leaving notifications)
  useEffect(() => {
    fetchUnreadCount();
  }, [pathname, fetchUnreadCount]);

  // Realtime: refetch count when any notification changes
  useEffect(() => {
    pb.collection("notification").subscribe("*", () => {
      fetchUnreadCount();
    });
    return () => {
      pb.collection("notification").unsubscribe("*");
    };
  }, [fetchUnreadCount]);

  // Fallback poll every 60s in case realtime misses events
  useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <View className="relative mr-2">
      <Button
        variant="ghost"
        size="icon"
        onPress={() => router.push("/(protected)/notifications")}
        className="rounded-full bg-gray-200"
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

  // Preload notifications so the notifications tab opens instantly
  useEffect(() => {
    void preloadNotifications();
  }, []);

  type DrawerLeafItem = { label: string; route: string; icon: any };
  type DrawerGroupItem = { label: string; icon: any; items: DrawerLeafItem[] };
  type DrawerItem = {
    id: string;
    title: string;
    icon: any;
    route: string;
    color: string;
    items: Array<DrawerLeafItem | DrawerGroupItem>;
  };

  const drawerItems: DrawerItem[] = [
    {
      id: "cfs",
      title: "CFS",
      icon: Container,
      route: "/(protected)/cfs/order/",
      color: "bg-blue-500",
      items: [
        { label: "Orders", route: "/(protected)/cfs/order", icon: Container },
        { label: "Pricing Request", route: "/(protected)/cfs/pricing-request", icon: Receipt },
        { label: "Track & Trace", route: "/(protected)/cfs/track-trace", icon: MapPin },
        { label: "EIR Copy Request", route: "/(protected)/cfs/eir-copy", icon: FileText },
        { label: "Proforma Invoice", route: "/(protected)/cfs/proforma-invoice", icon: File },
        { label: "Priority Movements", route: "/(protected)/cfs/priority-movements", icon: Play },
        { label: "Weighment Slip", route: "/(protected)/cfs/weighment-slip", icon: Scale },
        { label: "Special Equipment ", route: "/(protected)/cfs/special-equipment", icon: Grid2x2 },
        { label: "Container Grounding", route: "/(protected)/cfs/container-grounding", icon: ArrowDown },
        { label: "Container Staging", route: "/(protected)/cfs/container-staging", icon: Boxes },
        { label: "Re-Scanning", route: "/(protected)/cfs/re-scanning", icon: Scan },
        { label: "Tax Invoice", route: "/(protected)/cfs/tax-invoice", icon: Receipt },
        { label: "Tariff Request", route: "/(protected)/cfs/tariff-request", icon: ScrollText },
        { label: "One Time Tariff", route: "/(protected)/cfs/one-time-tariff", icon: FileText },
        { label: "Cheque Acceptance", route: "/(protected)/cfs/cheque-acceptance", icon: ReceiptIndianRupee },
      ],
    },
    {
      id: "warehouse",
      title: "Warehouse",
      icon: Warehouse,
      route: "/(protected)/warehouse/order",
      color: "bg-orange-500",
      items: [
        { label: "Orders", route: "/(protected)/warehouse/order", icon: Package },
        { label: "Pricing Request", route: "/(protected)/warehouse/pricing-request", icon: Receipt },
        { label: "Track & Trace", route: "/(protected)/warehouse/track-trace", icon: MapPin },
        { label: "EIR Copy", route: "/(protected)/warehouse/eir-copy", icon: FileText },
        { label: "Priority Movements", route: "/(protected)/warehouse/priority-movements", icon: Play },
        { label: "Weighment Slip", route: "/(protected)/warehouse/weighment-slip", icon: Scale },
        { label: "Special Equipment", route: "/(protected)/warehouse/special-equipment", icon: Grid2x2 },
        { label: "Container Staging", route: "/(protected)/warehouse/container-staging", icon: Boxes },
        { label: "Container Grounding", route: "/(protected)/warehouse/container-grounding", icon: ArrowDown },
        { label: "Re-Scanning", route: "/(protected)/warehouse/re-scanning", icon: Scan },
        { label: "Tax Invoice", route: "/(protected)/warehouse/tax-invoice", icon: ReceiptIndianRupee },
      ],
    },
    {
      id: "transport",
      title: "Transport",
      icon: Truck,
      route: "/(protected)/transport/pricing-request",
      color: "bg-green-500",
      items: [
        { label: "Orders", route: "/(protected)/transport/order", icon: Package },
        { label: "Order Movement", route: "/(protected)/transport/order-movement", icon: MapPin },
        { label: "Pricing Request", route: "/(protected)/transport/pricing-request", icon: Receipt },
        { label: "Service Request", route: "/(protected)/transport/service-requests", icon: Wrench },
      ],
    },
    {
      id: "3pl",
      title: "3PL",
      icon: Boxes,
      route: "/(protected)/orders/3pl",
      color: "bg-purple-500",
      items: [
        { label: "Orders", route: "/(protected)/orders/3pl/order", icon: Package },
        { label: "Pricing Request", route: "/(protected)/orders/3pl/pricing-request", icon: Receipt },
        { label: "Service Request", route: "/(protected)/orders/3pl/service-request", icon: Wrench },
        {
          label: "CFS",
          icon: Container,
          items: [
            { label: "Orders", route: "/(protected)/cfs/order", icon: Container },
            { label: "Pricing Request", route: "/(protected)/cfs/pricing-request", icon: Receipt },
            { label: "Track & Trace", route: "/(protected)/cfs/track-trace", icon: MapPin },
            { label: "EIR Copy Request", route: "/(protected)/cfs/eir-copy", icon: FileText },
            { label: "Proforma Invoice", route: "/(protected)/cfs/proforma-invoice", icon: File },
            { label: "Priority Movements", route: "/(protected)/cfs/priority-movements", icon: Play },
            { label: "Weighment Slip", route: "/(protected)/cfs/weighment-slip", icon: Scale },
            { label: "Special Equipment", route: "/(protected)/cfs/special-equipment", icon: Grid2x2 },
            { label: "Container Grounding", route: "/(protected)/cfs/container-grounding", icon: ArrowDown },
            { label: "Container Staging", route: "/(protected)/cfs/container-staging", icon: Boxes },
            { label: "Re-Scanning", route: "/(protected)/cfs/re-scanning", icon: Scan },
            { label: "Tax Invoice", route: "/(protected)/cfs/tax-invoice", icon: Receipt },
            { label: "Tariff Request", route: "/(protected)/cfs/tariff-request", icon: ScrollText },
            { label: "One Time Tariff", route: "/(protected)/cfs/one-time-tariff", icon: FileText },
            { label: "Cheque Acceptance", route: "/(protected)/cfs/cheque-acceptance", icon: ReceiptIndianRupee },
          ],
        },
        {
          label: "Transport",
          icon: Truck,
          items: [
            { label: "Orders", route: "/(protected)/transport/order", icon: Package },
            { label: "Order Movement", route: "/(protected)/transport/order-movement", icon: MapPin },
            { label: "Pricing Request", route: "/(protected)/transport/pricing-request", icon: Receipt },
            { label: "Service Request", route: "/(protected)/transport/service-requests", icon: Wrench },
          ],
        },
        {
          label: "Warehouse",
          icon: Warehouse,
          items: [
            { label: "Orders", route: "/(protected)/warehouse/order", icon: Package },
            { label: "Pricing Request", route: "/(protected)/warehouse/pricing-request", icon: Receipt },
            { label: "Track & Trace", route: "/(protected)/warehouse/track-trace", icon: MapPin },
            { label: "EIR Copy", route: "/(protected)/warehouse/eir-copy", icon: FileText },
            { label: "Priority Movements", route: "/(protected)/warehouse/priority-movements", icon: Play },
            { label: "Weighment Slip", route: "/(protected)/warehouse/weighment-slip", icon: Scale },
            { label: "Special Equipment", route: "/(protected)/warehouse/special-equipment", icon: Grid2x2 },
            { label: "Container Staging", route: "/(protected)/warehouse/container-staging", icon: Boxes },
            { label: "Container Grounding", route: "/(protected)/warehouse/container-grounding", icon: ArrowDown },
            { label: "Re-Scanning", route: "/(protected)/warehouse/re-scanning", icon: Scan },
            { label: "Tax Invoice", route: "/(protected)/warehouse/tax-invoice", icon: ReceiptIndianRupee },
          ],
        },
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
    <GestureHandlerRootView>
      <DrawerControlContext.Provider value={{ openDrawer: () => setDrawerOpen(true) }}>
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
                          {service.items.map((item) => {
                            const isGroup = (item as DrawerGroupItem).items !== undefined && !(item as any).route;
                            if (isGroup) {
                              const group = item as DrawerGroupItem;
                              return (
                                <Accordion key={`${service.id}-${group.label}`} type="single" collapsible className="gap-2">
                                  <AccordionItem value={`${service.id}-${group.label}`} className="border-border border rounded-lg">
                                    <AccordionTrigger className="px-3 py-2">
                                      <View className="flex-row items-center gap-3 flex-1">
                                        <Icon as={group.icon} size={18} className="text-muted-foreground" />
                                        <Text className="text-sm font-semibold flex-1">{group.label}</Text>
                                      </View>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-2 pb-2">
                                      <View className="gap-2">
                                        {group.items.map((child) => (
                                          <TouchableOpacity
                                            key={child.route}
                                            onPress={() => {
                                              router.push(child.route as any);
                                              setDrawerOpen(false);
                                            }}
                                            className="p-3 bg-muted/50 rounded-lg active:bg-muted"
                                          >
                                            <View className="flex-row items-center gap-3">
                                              <Icon as={child.icon} size={18} className="text-muted-foreground" />
                                              <Text className="text-sm font-medium flex-1">{child.label}</Text>
                                            </View>
                                          </TouchableOpacity>
                                        ))}
                                      </View>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              );
                            }

                            const leaf = item as DrawerLeafItem;
                            return (
                              <TouchableOpacity
                                key={leaf.route}
                                onPress={() => {
                                  router.push(leaf.route as any);
                                  setDrawerOpen(false);
                                }}
                                className="p-3 bg-muted/50 rounded-lg active:bg-muted"
                              >
                                <View className="flex-row items-center gap-3">
                                  <Icon as={leaf.icon} size={18} className="text-muted-foreground" />
                                  <Text className="text-sm font-medium flex-1">{leaf.label}</Text>
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollView>
              <View className="px-4 py-4">
                <Button variant={'destructive'}>
                  <Text>Logout</Text>
                </Button>
              </View>
            </Fragment>
          )}
        >
          <Tabs
            screenOptions={{
              tabBarShowLabel: true,
              tabBarActiveTintColor: "blue",
              tabBarStyle: {
                height: 85,
                paddingTop: 10,
              },
              headerRight: () => (
                <View className="flex-row items-center px-2">
                  <NotificationIcon />
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
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                  <Icon
                    as={Home}
                    size={focused ? 30 : 25}
                    className={`${focused ? "text-primary" : "text-gray-400"} transition-colors`}
                  />
                ),
                tabBarLabel: ({ focused }) => <Text className={`text-[10px] ${focused ? "text-primary" : ""}`}>Home</Text>,
              }}
            />

            <Tabs.Screen
              name="dashboard"
              options={{
                tabBarIcon: ({ focused }) => (
                  <Icon
                    as={LayoutDashboardIcon}
                    size={focused ? 30 : 25}
                    className={`${focused ? "text-primary" : "text-gray-400"} transition-colors`}
                  />
                ),
                headerTitle: () => <Text className="text-2xl dark:text-foreground">Dashboard</Text>,
                tabBarLabel: ({ focused }) => <Text className={`text-[10px] ${focused ? "text-primary" : ""}`}>Dashboard</Text>,
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
                    size={focused ? 30 : 25}
                    className={`${focused ? "text-primary" : "text-gray-400"} transition-colors`}
                  />
                ),
                headerTitle: () => <Text className="text-2xl dark:text-foreground">CON-Management</Text>,
                tabBarLabel: ({ focused }) => <Text className={`text-[10px] ${focused ? "text-primary" : ""}`}>Container</Text>,
              }}
            />

            < Tabs.Screen
              name="profile"
              options={{
                tabBarIcon: ({ focused }) => (
                  <Icon
                    as={UserCircle}
                    size={focused ? 30 : 25}
                    className={`${focused ? "text-primary" : "text-gray-400"} transition-colors`}
                  />
                ),
                headerTitle: () => <Text className="text-2xl dark:text-foreground">Profile</Text>,
                tabBarLabel: ({ focused }) => <Text className={`text-[10px] ${focused ? "text-primary" : ""}`}>Profile</Text>,
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

            <Tabs.Screen
              name="cfs"
              options={{
                headerShown: false,
                href: null,
              }}
            />

            <Tabs.Screen
              name="transport"
              options={{
                href: null,
              }}
            />

            <Tabs.Screen
              name="warehouse"
              options={{
                headerShown: false,
                href: null,
              }}
            />
          </Tabs>
        </Drawer>
      </DrawerControlContext.Provider>
    </GestureHandlerRootView>
  )
}
