import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from "@/components/ui/select";
import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { createNotificationForCurrentUser } from "@/lib/actions/notifications/notification";
import LoadingView from "@/components/LoadingView";
import { Stack } from "expo-router";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft } from "lucide-react-native";
import { ActivityIndicator } from "react-native";

const containerTypes: Option[] = [
  { value: "General", label: "General" },
  { value: "ODC/FR/OT", label: "ODC/FR/OT" },
  { value: "Refer", label: "Refer" },
  { value: "Mix", label: "Mix" },
];

const delayTypes: Option[] = [
  { value: "DPD", label: "DPD" },
  { value: "Non-DPD", label: "Non-DPD" },
];

type ServiceProvider = { id: string; title?: string; description?: string };

export default function ThreePlPricingRequestCreatePage() {
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [containerType, setContainerType] = useState<Option | undefined>(undefined);
  const [delayType, setDelayType] = useState<Option | undefined>(undefined);
  const [preferableRate, setPreferableRate] = useState("");
  const [containersPerMonth, setContainersPerMonth] = useState("");

  useEffect(() => {
    if (!providerId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const record = await pb.collection("service_provider").getOne(providerId);
        setProvider(record as ServiceProvider);
      } catch (err: any) {
        Alert.alert("Error", err?.message || "Failed to load provider");
      } finally {
        setLoading(false);
      }
    })();
  }, [providerId]);

  const handleSubmit = async () => {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      Alert.alert("Error", "Please log in again.");
      return;
    }
    if (!containerType?.value || !delayType?.value) {
      Alert.alert("Error", "Please select container type and delay type.");
      return;
    }
    setSubmitting(true);
    try {
      await pb.collection("3pl_pricing_request").create({
        user: user.user.id,
        serviceProvider: providerId,
        containerType: containerType.value,
        delayType: delayType.value,
        preferableRate: preferableRate.trim() ? parseFloat(preferableRate) : undefined,
        containersPerMonth: containersPerMonth.trim() ? parseFloat(containersPerMonth) : undefined,
        status: "Pending",
      });
      try {
        await createNotificationForCurrentUser({
          title: "3PL Pricing Request Submitted",
          description: `Your pricing request for ${provider?.title || "3PL provider"} has been submitted.`,
          type: "alert",
        });
      } catch (_) {}
      Alert.alert("Success", "Pricing request submitted successfully.", [
        { text: "OK", onPress: () => router.replace("/(protected)/orders/3pl/pricing-request") },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to submit pricing request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingView LoadingText="Loading provider..." />;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "New 3PL Pricing Request",
          headerLeft: () => (
            <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-full mr-2">
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          {provider && (
            <View className="p-4 bg-muted rounded-lg">
              <Text className="text-sm text-muted-foreground mb-1">Provider</Text>
              <Text className="text-lg font-semibold">{provider.title || "Unnamed"}</Text>
              {provider.description && (
                <Text className="text-sm text-muted-foreground mt-1">{provider.description}</Text>
              )}
            </View>
          )}
          <View className="gap-4">
            <View>
              <Label>Container Type *</Label>
              <Select value={containerType} onValueChange={setContainerType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {containerTypes.map((o) => (
                    <SelectItem key={o.value} value={o.value} label={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>
            <View>
              <Label>Delay Type *</Label>
              <Select value={delayType} onValueChange={setDelayType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {delayTypes.map((o) => (
                    <SelectItem key={o.value} value={o.value} label={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>
            <View>
              <Label>Preferable Rate</Label>
              <Input
                value={preferableRate}
                onChangeText={setPreferableRate}
                placeholder="Rate"
                keyboardType="numeric"
              />
            </View>
            <View>
              <Label>Containers Per Month</Label>
              <Input
                value={containersPerMonth}
                onChangeText={setContainersPerMonth}
                placeholder="Count"
                keyboardType="numeric"
              />
            </View>
            <Button
              onPress={handleSubmit}
              disabled={submitting || !containerType?.value || !delayType?.value}
              className="w-full mt-4"
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text>Submit Pricing Request</Text>
              )}
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
