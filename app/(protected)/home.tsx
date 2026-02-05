import HomeServiceProvider from "@/components/home/ServiceProviders";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Boxes, Container, LucideIcon, Package, Search, Truck, Warehouse } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, RefreshControl, Pressable } from "react-native";

interface Services {
  title: string,
  icon: LucideIcon,
}

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [selectedService, setSelectedService] = useState("CFS");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const services: Services[] = [
    {
      title: "CFS",
      icon: Container,
    },
    {
      title: "Transport",
      icon: Truck,
    },
    {
      title: "3PL",
      icon: Boxes,
    },
    {
      title: "Warehouse",
      icon: Warehouse,
    },
  ]

  const handleServicePress = (service: Services, index: number) => {
    // Toggle service selection - if same service clicked, deselect it
    if (activeIndex === index) {
      setActiveIndex(null);
      setSelectedService("");
    } else {
      setActiveIndex(index);
      setSelectedService(service.title);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    // Trigger refresh by updating refreshKey which will cause HomeServiceProvider to refetch
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <ScrollView
      contentContainerClassName=""
      className="px-4 pt-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Services Tabs */}
      <View className="flex-row justify-around py-3 px-2 bg-background shadow-md border border-gray-200 mb-5 rounded-lg">
        {services.map((service, index) => (
          <Pressable
            key={index}
            className="items-center gap-1"
            onPress={() => handleServicePress(service, index)}
          >
            <Icon
              as={service.icon}
              size={25}
              className={activeIndex !== null && index === activeIndex ? "text-primary" : ""}
            />
            <Text className={activeIndex !== null && index === activeIndex ? "text-primary" : "text-foreground"}>{service.title}</Text>
          </Pressable>
        ))}
      </View>

      {/* Search Services Providers */}
      <View className="flex-row gap-1 w-full mb-4">
        <Input
          placeholder="Search Providers"
          className="flex-1 h-10 sm:h-auto text-base sm:text-lg"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <HomeServiceProvider selectedService={selectedService} searchQuery={searchQuery} refreshKey={refreshKey} />
    </ScrollView >
  )
}

