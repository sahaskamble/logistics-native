import HomeServiceProvider from "@/components/home/ServiceProviders";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useDrawerControl } from "@/app/(protected)/_layout";
import { getUnreadNotificationsCountForCurrentUser } from "@/lib/actions/notifications/notification";
import {
  Bell,
  Boxes,
  ChevronDown,
  Container,
  Filter,
  LucideIcon,
  Menu,
  Search,
  Truck,
  Warehouse,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";

interface ServiceItem {
  title: string;
  icon: LucideIcon;
}

const SERVICES: ServiceItem[] = [
  { title: "CFS", icon: Container },
  { title: "Transport", icon: Truck },
  { title: "3PL", icon: Boxes },
  { title: "Warehouse", icon: Warehouse },
];

const DEFAULT_SERVICE_INDEX = 0; // CFS

export default function HomePage() {
  const router = useRouter();
  const { openDrawer } = useDrawerControl();
  const [activeIndex, setActiveIndex] = useState<number | null>(DEFAULT_SERVICE_INDEX);
  const [selectedService, setSelectedService] = useState(SERVICES[DEFAULT_SERVICE_INDEX].title);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    const res = await getUnreadNotificationsCountForCurrentUser();
    if (res.success) setUnreadCount(res.output ?? 0);
  }, []);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  const handleServicePress = (service: ServiceItem, index: number) => {
    if (activeIndex === index) return; // Keep current selection when clicking the same service
    setActiveIndex(index);
    setSelectedService(service.title);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    fetchUnread();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Blue header */}
      <View className="bg-primary px-4 pt-12 h-60 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={openDrawer}
            className="w-10 h-10 rounded-full bg-primary-foreground/20 items-center justify-center"
          >
            <Icon as={Menu} size={22} className="text-white" />
          </Pressable>
          <View className="flex-1 items-center">
            <Text className="text-xs text-primary-foreground/80">LOCATION</Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-base font-semibold text-white">
                Mumbai, India
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/(protected)/notifications")}
            className="w-10 h-10 rounded-full bg-primary-foreground/20 items-center justify-center"
          >
            <Icon as={Bell} size={22} className="text-white" />
            {unreadCount > 0 && (
              <View className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive items-center justify-center">
                <Text className="text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
        <Text className="text-2xl text-balance tracking-tight font-bold text-white text-center mt-4">
          Find your next logistics partner
        </Text>
      </View>

      {/* Search bar - white, overlapping */}
      <View className="px-4 -mt-8 z-10">
        <View className="flex-row items-center justify-center bg-white rounded-2xl border border-border shadow-lg px-3 py-2.5 gap-2 w-[93%] mx-auto">
          <Icon as={Search} size={20} className="text-muted-foreground" />
          <Input
            placeholder="Search Providers"
            placeholderTextColor="#9ca3af"
            className="flex-1 border-0 bg-transparent shadow-none text-base min-h-0 py-0 pt-0.5"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {/* <Pressable className="p-1">
            <Icon as={Filter} size={20} className="text-primary" />
          </Pressable> */}
        </View>
      </View>

      {/* Service category icons */}
      <View className="px-4 pt-6 pb-2">
        <View className="flex-row justify-between">
          {SERVICES.map((service, index) => (
            <Pressable
              key={service.title}
              onPress={() => handleServicePress(service, index)}
              className="items-center gap-2 flex-1"
            >
              <View
                className={`w-14 h-14 rounded-2xl items-center justify-center ${activeIndex === index ? "bg-primary/15" : "bg-muted/60"
                  }`}
              >
                <Icon
                  as={service.icon}
                  size={26}
                  className={
                    activeIndex === index ? "text-primary" : "text-primary/70"
                  }
                />
              </View>
              <Text
                className={`text-sm font-medium ${activeIndex === index ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                {service.title}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Top Rated Providers */}
      <View className="px-4 pt-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-foreground">
            Top Rated Providers
          </Text>
        </View>
        <HomeServiceProvider
          selectedService={selectedService}
          searchQuery={searchQuery}
          refreshKey={refreshKey}
        />
      </View>
    </ScrollView>
  );
}
