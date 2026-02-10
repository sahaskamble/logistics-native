import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft, Wrench } from "lucide-react-native";
import LoadingView from "@/components/LoadingView";
import pb from "@/lib/pocketbase/pb";

type SubService = { id: string; title?: string };

export default function ThreePlServiceRequestIndexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subServices, setSubServices] = useState<SubService[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const service = await pb.collection("services").getFirstListItem<{ id: string }>(`title="3PL"`);
        if (service?.id) {
          const list = await pb.collection("sub_services").getFullList<SubService>({
            filter: `service="${service.id}"`,
            sort: "title",
          });
          if (mounted) setSubServices(list);
        }
      } catch (err: any) {
        if (mounted) Alert.alert("Error", err?.message || "Failed to load service types.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingView LoadingText="Loading..." />;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "3PL Service Request",
          headerLeft: () => (
            <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-full mr-2">
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-3">
          <Text className="text-muted-foreground">
            Select a service type to create a new 3PL service request.
          </Text>
          {subServices.length === 0 ? (
            <Card>
              <CardContent className="py-6">
                <Text className="text-muted-foreground text-center">No 3PL service types found.</Text>
              </CardContent>
            </Card>
          ) : (
            subServices.map((s) => (
              <Pressable
                key={s.id}
                onPress={() =>
                  router.push({
                    pathname: "/(protected)/orders/3pl/service-request/create",
                    params: { serviceTypeTitle: s.title || "" },
                  })
                }
              >
                <Card className="active:opacity-90">
                  <CardHeader className="flex-row items-center gap-3">
                    <View className="bg-purple-500/10 rounded-full p-2">
                      <Icon as={Wrench} size={22} className="text-purple-500" />
                    </View>
                    <View className="flex-1">
                      <CardTitle>{s.title || "Service"}</CardTitle>
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
