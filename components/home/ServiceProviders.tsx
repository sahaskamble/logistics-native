import { getServiceProviders } from "@/lib/actions/providers/fetch";
import type { ServiceProvider } from "@/lib/actions/providers/fetch";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image, NativeScrollEvent, NativeSyntheticEvent, Text } from "react-native";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollView, View } from "react-native";
import { Star } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import pb from "@/lib/pocketbase/pb";
import PricingRequestDialog from "./PricingRequest";
import { Link, useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  provider: ServiceProvider;
}

function ServiceProviderCard({ provider }: Props) {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = provider.files || [];

  const handleViewDetails = () => {
    // Navigate to details page with provider ID
    router.push(`/(protected)/details/${provider.id}`);
  };

  const startAutoScroll = () => {
    if (autoScrollRef.current || images.length <= 1) return;

    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % images.length;
        scrollRef.current?.scrollTo({
          x: next * SCREEN_WIDTH,
          animated: true,
        });
        return next;
      });
    }, 4000);
  };

  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  // Auto-scroll logic
  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [images.length]);

  // Pause auto-scroll on user interaction
  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
    startAutoScroll();
  };

  const handleScrollBegin = () => {
    stopAutoScroll();
  };

  return (
    <Card className="mb-6 shadow-lg pt-0 pb-4">
      {/* Top image mask */}
      <View
        style={{
          overflow: "hidden",
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
        {/* Image Carousel */}
        <AspectRatio ratio={16 / 9}>
          <ScrollView
            ref={scrollRef}
            style={{ width: SCREEN_WIDTH, height: "100%" }}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScrollBeginDrag={handleScrollBegin}
            onMomentumScrollEnd={handleScrollEnd}
          >
            {images.length > 0 ? (
              images.map((file: string, idx: number) => (
                <View
                  key={idx}
                  style={{ width: SCREEN_WIDTH, height: "100%" }}
                >
                  <Image
                    source={{ uri: pb.files.getURL(provider, file) }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              ))
            ) : (
              <View className="bg-muted w-full h-full justify-center items-center">
                <Text className="text-muted-foreground">No images available</Text>
              </View>
            )}
          </ScrollView>

          {/* Optional: Dot indicators */}
          {images.length > 1 && (
            <View className="absolute bottom-2 left-0 right-0 flex-row justify-center gap-1">
              {images.map((_: string, idx: number) => (
                <View
                  key={idx}
                  className={`w-2 h-2 rounded-full ${idx === currentIndex ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </View>
          )}
        </AspectRatio>
      </View>

      <CardHeader>
        <View className="flex-row justify-between items-start">
          <CardTitle className="text-xl">{provider.title || "Unnamed Provider"}</CardTitle>

          {/* Rating */}
          <View className="flex-row items-center gap-1">
            <Icon as={Star} size={18} className="text-yellow-500 fill-yellow-500" />
            <Text className="font-semibold">{provider.rating?.toFixed(1) || "N/A"}</Text>
          </View>
        </View>

        <CardDescription className="mt-2">
          {provider.description || "Reliable logistics partner for CFS, transport, and warehousing services."}
        </CardDescription>
      </CardHeader>

      <CardContent className="gap-4">
        {/* Key Features  Tags */}

        {provider.features && provider.features?.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {provider.features?.slice(0, 4).map((feature: string, i: number) => (
              <Badge key={i} variant="secondary" className="px-2 py-1">
                <Text className="">{feature}</Text>
              </Badge>
            ))}
            {provider.features?.length > 4 && (
              <Badge variant="outline">
                <Text className="text-xs">+{provider.features?.length - 4} more</Text>
              </Badge>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-3 mt-4">
          <PricingRequestDialog providerId={provider.id} />
          <Link
            asChild
            href={`/details/${provider.id}`}>
            <Button
              className="flex-1"
              variant="outline"
              onPress={handleViewDetails}
            >
              <Text className="font-medium">View Details</Text>
            </Button>
          </Link>
        </View>
      </CardContent>
    </Card>
  );
}

export default function HomeServiceProvider({
  selectedService,
  searchQuery,
  refreshKey,
}: { selectedService: string, searchQuery: string, refreshKey?: number }) {

  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServiceProviders = async () => {
    setLoading(true);
    const result = await getServiceProviders(selectedService || undefined, searchQuery || undefined);
    setServiceProviders(result.output);
    setLoading(false);
  }

  useEffect(() => {
    fetchServiceProviders();
  }, [selectedService, searchQuery, refreshKey])

  if (loading) {
    return (
      <View className="items-center py-12">
        <Text className="text-muted-foreground text-lg">Loading providers...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerClassName="">
      {serviceProviders.length === 0 ? (
        <View className="items-center py-12">
          <Text className="text-muted-foreground text-lg">
            {selectedService || searchQuery
              ? "No providers found matching your criteria"
              : "No providers found"}
          </Text>
        </View>
      ) : (
        serviceProviders.map((provider) => (
          <ServiceProviderCard key={provider.id} provider={provider} />
        ))
      )}
    </ScrollView>
  )
}

