import HomeServiceProvider from "@/components/home/ServiceProviders";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Boxes, Container, LucideIcon, Package, Search, Truck, Warehouse } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface Services {
  title: string,
  icon: LucideIcon,
}

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);
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
    {
      title: "Custom Packages",
      icon: Package,
    }
  ]

  const handleServicePress = (service: Services, index: number) => {
    console.log(`Service pressed: ${service.title}`);
    // Add your navigation or action here
    console.log(index);
    setActiveIndex(index);
  }

  return (
    <ScrollView
      contentContainerClassName=""
      className="px-4 pt-4"
    >
      {/* Horizontally Scrollable Services */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerClassName="px-0 pb-4 gap-3"
        className="w-full"
      >
        {services.map((service, index) => {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleServicePress(service, index)}
              className={`w-auto flex-row items-center gap-2 px-4 py-3 rounded-lg border border-border transition-all ${index === activeIndex
                ? 'bg-primary'
                : 'bg-card'  // or 'bg-transparent' if you want inactive ones lighter
                }`}
              activeOpacity={0.7}
            >
              <Icon
                as={service.icon}
                size={24}
                className={index === activeIndex ? 'text-primary-foreground' : 'text-foreground'}
              />
              <Text
                className={`text-base font-medium ${index === activeIndex ? 'text-primary-foreground' : 'text-foreground'
                  }`}
              >
                {service.title}
              </Text>
            </TouchableOpacity>)
        })}
      </ScrollView>

      {/* Search Services Providers */}
      <View className="flex-row gap-1 w-full mb-4">
        <Input
          placeholder="Search Providers"
          className="flex-1 h-12 sm:h-auto text-xl sm:text-lg"
        />
        <Button
          size={"icon"}
          variant={'outline'}
          className="h-12 sm:h-auto"
        >
          <Icon as={Search} size={25} />
        </Button>
      </View>
      <HomeServiceProvider />
    </ScrollView >
  )
}

