import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft, Receipt } from "lucide-react-native";
import { getServiceProviders } from "@/lib/actions/providers/fetch";
import LoadingView from "@/components/LoadingView";

export default function ThreePlPricingRequestIndexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<{ id: string; title?: string; description?: string }[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await getServiceProviders({ serviceTitle: "3PL" });
      if (!mounted) return;
      if (res.success) setProviders(res.output || []);
      else Alert.alert("Error", res.message);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingView LoadingText="Loading providers..." />;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "3PL Pricing Request",
          headerLeft: () => (
            <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-full mr-2">
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-3">
          <Text className="text-muted-foreground">Select a 3PL provider to submit a pricing request.</Text>
          {providers.length === 0 ? (
            <Card>
              <CardContent className="py-6">
                <Text className="text-muted-foreground text-center">No 3PL providers found.</Text>
              </CardContent>
            </Card>
          ) : (
            providers.map((p) => (
              <Pressable
                key={p.id}
                onPress={() =>
                  router.push({
                    pathname: "/(protected)/orders/3pl/pricing-request/[providerId]/create",
                    params: { providerId: p.id },
                  })
                }
              >
                <Card className="active:opacity-90">
                  <CardHeader className="flex-row items-center gap-3">
                    <View className="bg-purple-500/10 rounded-full p-2">
                      <Icon as={Receipt} size={22} className="text-purple-500" />
                    </View>
                    <View className="flex-1">
                      <CardTitle>{p.title || "Provider"}</CardTitle>
                      {p.description && (
                        <Text className="text-sm text-muted-foreground mt-0.5" numberOfLines={2}>
                          {p.description}
                        </Text>
                      )}
                    </View>
                  </CardHeader>
                </Card>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}
