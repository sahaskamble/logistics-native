import { getServiceProviders } from "@/lib/actions/providers/fetch";
import type { ServiceProvider } from "@/lib/actions/providers/fetch";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import pb from "@/lib/pocketbase/pb";
import PricingRequestDialog from "./PricingRequest";
import { useRouter } from "expo-router";
import { Heart, Star } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_IMAGE_WIDTH = SCREEN_WIDTH - 32;


function getServiceTypeLabel(provider: ServiceProvider): string {
  const expanded = (provider as any).expand?.service;
  if (!expanded) return "SERVICE";
  const services = Array.isArray(expanded) ? expanded : [expanded];
  const title = services[0]?.title;
  return (title || "SERVICE").toString().toUpperCase();
}

interface Props {
  provider: ServiceProvider;
}

function ServiceProviderCard({ provider }: Props) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const images = provider.files || [];
  const serviceLabel = getServiceTypeLabel(provider);

  const startAutoScroll = () => {
    if (autoScrollRef.current || images.length <= 1) return;
    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % images.length;
        scrollRef.current?.scrollTo({
          x: next * CARD_IMAGE_WIDTH,
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

  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [images.length]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_IMAGE_WIDTH);
    setCurrentIndex(index);
    startAutoScroll();
  };

  const handleViewDetails = () => {
    router.push(`/(protected)/details/${provider.id}`);
  };

  return (
    <Card className="mb-6 overflow-hidden rounded-xl border border-border pt-0">
      {/* Image carousel with overlays */}
      <View className="relative w-full overflow-hidden">
        <View style={{ width: "100%", aspectRatio: 16 / 9 }}>
          {images.length > 0 ? (
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScrollBeginDrag={stopAutoScroll}
              onMomentumScrollEnd={handleScrollEnd}
              style={{ width: CARD_IMAGE_WIDTH, flex: 1 }}
              contentContainerStyle={{ width: CARD_IMAGE_WIDTH * images.length }}
            >
              {images.map((file: string, idx: number) => (
                <View
                  key={idx}
                  style={{ width: CARD_IMAGE_WIDTH, flex: 1 }}
                >
                  <Image
                    source={{ uri: pb.files.getURL(provider, file) }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View
              className="bg-muted w-full h-full items-center justify-center"
              style={{ width: CARD_IMAGE_WIDTH }}
            >
              <Text className="text-muted-foreground text-sm">No image</Text>
            </View>
          )}
          {/* Badge top-left */}
          <View className="absolute top-3 left-3">
            <View className="bg-white/95 px-2.5 py-1 rounded-full">
              <Text className="text-primary text-xs font-semibold">{serviceLabel}</Text>
            </View>
          </View>
          {/* Heart top-right */}
          {/* <Pressable
            onPress={() => setFavorited((v) => !v)}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 items-center justify-center"
          >
            <Icon
              as={Heart}
              size={20}
              className={favorited ? "text-destructive fill-destructive" : "text-muted-foreground"}
            />
          </Pressable> */}
          {/* Dot indicators */}
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
        </View>
      </View>

      <CardHeader className="pb-2">
        <View className="flex-row justify-between items-start gap-2">
          <CardTitle className="text-base flex-1" numberOfLines={1}>
            {provider.title || "Unnamed Provider"}
          </CardTitle>
          <View className="flex-row items-center gap-0.5">
            <Icon as={Star} size={16} className="text-yellow-500 fill-yellow-500" />
            <Text className="text-sm font-semibold">
              {provider.rating?.toFixed(1) ?? "N/A"}
            </Text>
          </View>
        </View>
        <Text
          className="text-sm text-muted-foreground mt-1"
          numberOfLines={2}
        >
          {provider.description ||
            "Reliable logistics partner for CFS, transport, and warehousing services."}
        </Text>
      </CardHeader>

      <CardContent className="flex-row gap-3 pt-0">
        <PricingRequestDialog providerId={provider.id} className="flex-1" />
        <Button
          variant="outline"
          className="flex-1"
          onPress={handleViewDetails}
        >
          <Text className="font-medium">View Details</Text>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function HomeServiceProvider({
  selectedService,
  searchQuery,
  refreshKey,
}: {
  selectedService: string;
  searchQuery: string;
  refreshKey?: number;
}) {
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServiceProviders = async () => {
    setLoading(true);
    const result = await getServiceProviders({
      serviceTitle: selectedService || undefined,
      searchQuery: searchQuery || undefined,
      options: { expand: "service" },
    });
    setServiceProviders(result.output ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchServiceProviders();
  }, [selectedService, searchQuery, refreshKey]);

  if (loading) {
    return (
      <View className="items-center py-12">
        <Text className="text-muted-foreground text-lg">Loading providers...</Text>
      </View>
    );
  }

  if (serviceProviders.length === 0) {
    return (
      <View className="items-center py-12">
        <Text className="text-muted-foreground text-lg text-center">
          {selectedService || searchQuery
            ? "No providers found matching your criteria"
            : "No providers found"}
        </Text>
      </View>
    );
  }

  return (
    <View>
      {serviceProviders.map((provider) => (
        <ServiceProviderCard key={provider.id} provider={provider} />
      ))}
    </View>
  );
}
