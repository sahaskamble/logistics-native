import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View, Alert, ActivityIndicator } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useState, useEffect } from "react";
import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { createNotificationForCurrentUser } from "@/lib/actions/notifications/notification";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingView from "@/components/LoadingView";

type ServiceProvider = {
  id: string;
  title?: string;
  description?: string;
};

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

const statusOptions: Option[] = [
  { value: "Pending", label: "Pending" },
  { value: "Accepted", label: "Accepted" },
  { value: "Rejected", label: "Rejected" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

export default function CreatePricingRequestPage() {
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [formData, setFormData] = useState({
    user: '',
    serviceProvider: '',
    containerType: undefined as Option | undefined,
    delayType: undefined as Option | undefined,
    status: undefined as Option | undefined,
    extra_info: {
      'twentyft': {
        clicked: false,
        preferableRate: "",
        containersPerMonth: "",
        freeGroundRentDays: "",
      },
      'fortyft': {
        clicked: false,
        preferableRate: "",
        containersPerMonth: "",
        freeGroundRentDays: "",
      },
    },
  });

  useEffect(() => {
    const fetchProvider = async () => {
      if (!providerId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const record = await pb.collection("service_provider").getOne(providerId);
        setProvider(record as ServiceProvider);
        setFormData((prev) => ({
          ...prev,
          serviceProvider: providerId,
        }));
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching provider:", error);
        setLoading(false);
      }
    };

    fetchProvider();
  }, [providerId]);

  const handleContainerCheckbox = (containerType: 'twentyft' | 'fortyft', checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      extra_info: {
        ...prev.extra_info,
        [containerType]: {
          ...prev.extra_info[containerType],
          clicked: checked,
          // Reset fields when unchecked
          ...(checked ? {} : {
            preferableRate: "",
            containersPerMonth: "",
            freeGroundRentDays: "",
          }),
        },
      },
    }));
  };

  const handleContainerFieldChange = (
    containerType: 'twentyft' | 'fortyft',
    field: 'preferableRate' | 'containersPerMonth' | 'freeGroundRentDays',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      extra_info: {
        ...prev.extra_info,
        [containerType]: {
          ...prev.extra_info[containerType],
          [field]: value,
        },
      },
    }));
  };

  async function handleSubmitPricingRequest() {
    try {
      const user = getCurrentUser();
      if (!user.isValid) {
        Alert.alert("Error", "User not authenticated. Please login again.");
        return;
      }

      setSubmitting(true);

      // Prepare extra_info - always include both twentyft and fortyft with all fields
      // Use empty string "" for missing values, keep values as strings
      const extra_info: any = {
        twentyft: {
          agreedAmount: "",
          billingAmount: "",
          clicked: formData.extra_info.twentyft.clicked,
          containerPerMonths: formData.extra_info.twentyft.containersPerMonth || "",
          freeGroundRentDays: formData.extra_info.twentyft.freeGroundRentDays || "",
          groundrentFreeDays: "",
          preferableRate: formData.extra_info.twentyft.preferableRate || "",
        },
        fortyft: {
          agreedAmount: "",
          billingAmount: "",
          clicked: formData.extra_info.fortyft.clicked,
          containerPerMonths: formData.extra_info.fortyft.containersPerMonth || "",
          freeGroundRentDays: formData.extra_info.fortyft.freeGroundRentDays || "",
          groundrentFreeDays: "",
          preferableRate: formData.extra_info.fortyft.preferableRate || "",
        },
      };

      const data = {
        user: user.user?.id || '',
        serviceProvider: providerId || '',
        containerType: formData.containerType?.value || undefined,
        delayType: formData.delayType?.value || undefined,
        status: "Pending" as const,
        extra_info: extra_info,
      };

      // Submit to PocketBase
      await pb.collection("cfs_pricing_request").create(data);

      try {
        await createNotificationForCurrentUser({
          title: "Pricing Request Submitted",
          description: `Your pricing request for ${provider?.title || "service provider"} has been submitted successfully.`,
          type: "alert",
        });
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
      }

      setFormData({
        user: '',
        serviceProvider: '',
        containerType: undefined as Option | undefined,
        delayType: undefined as Option | undefined,
        status: undefined as Option | undefined,
        extra_info: {
          'twentyft': {
            clicked: false,
            preferableRate: "",
            containersPerMonth: "",
            freeGroundRentDays: "",
          },
          'fortyft': {
            clicked: false,
            preferableRate: "",
            containersPerMonth: "",
            freeGroundRentDays: "",
          },
        },
      });

      // Show success alert
      Alert.alert(
        "Success",
        "Pricing request submitted successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err: any) {
      console.error("Error Submitting Pricing Request", err);
      Alert.alert(
        "Error",
        err?.message || "Failed to submit pricing request. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isFormValid = () => {
    return (
      formData.containerType?.value &&
      formData.delayType?.value &&
      (formData.extra_info.twentyft.clicked || formData.extra_info.fortyft.clicked) &&
      (!formData.extra_info.twentyft.clicked || (
        formData.extra_info.twentyft.preferableRate &&
        formData.extra_info.twentyft.containersPerMonth &&
        formData.extra_info.twentyft.freeGroundRentDays
      )) &&
      (!formData.extra_info.fortyft.clicked || (
        formData.extra_info.fortyft.preferableRate &&
        formData.extra_info.fortyft.containersPerMonth &&
        formData.extra_info.fortyft.freeGroundRentDays
      ))
    );
  };

  if (loading) {
    return <LoadingView LoadingText="Loading provider information..." />;
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        {/* Provider Info */}
        {provider && (
          <View className="p-4 bg-muted rounded-lg mb-4">
            <Text className="text-sm text-muted-foreground mb-1">Service Provider</Text>
            <Text className="text-lg font-semibold">{provider.title || "Unnamed Provider"}</Text>
            {provider.description && (
              <Text className="text-sm text-muted-foreground mt-1">{provider.description}</Text>
            )}
          </View>
        )}

        {/* Form */}
        <View className="w-full gap-4">
          {/* Container Type Select */}
          <View className="w-full gap-2">
            <Label>Container Type *</Label>
            <Select
              value={formData.containerType || undefined}
              onValueChange={(value: Option) => {
                setFormData((prev) => ({
                  ...prev,
                  containerType: value,
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Container Type" />
              </SelectTrigger>
              <SelectContent>
                {containerTypes.map((type: Option) => {
                  if (!type) return null;
                  return (
                    <SelectItem key={type.value} value={type.value} label={type.label}>
                      {type.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </View>

          {/* Delay Type Select */}
          <View className="w-full gap-2">
            <Label>Delay Type *</Label>
            <Select
              value={formData.delayType || undefined}
              onValueChange={(value: Option) => {
                setFormData((prev) => ({
                  ...prev,
                  delayType: value,
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Delay Type" />
              </SelectTrigger>
              <SelectContent>
                {delayTypes.map((type: Option) => {
                  if (!type) return null;
                  return (
                    <SelectItem key={type.value} value={type.value} label={type.label}>
                      {type.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </View>

          {/* Container Size Checkboxes */}
          <View className="w-full gap-4">
            <Label>Container Size * (Select at least one)</Label>

            {/* 20ft Checkbox */}
            <View className="flex-row items-center gap-3 p-3 border border-border rounded-lg">
              <Checkbox
                checked={formData.extra_info.twentyft.clicked}
                onCheckedChange={(checked) => handleContainerCheckbox('twentyft', checked as boolean)}
              />
              <Text className="flex-1 text-base font-medium">20ft Container</Text>
            </View>

            {/* 20ft Fields - Show when checked */}
            {formData.extra_info.twentyft.clicked && (
              <View className="ml-4 gap-3 p-3 bg-muted rounded-lg">
                <View className="w-full gap-2">
                  <Label>Preferable Rate (20ft)</Label>
                  <Input
                    placeholder="Enter preferable rate"
                    value={formData.extra_info.twentyft.preferableRate}
                    onChangeText={(text) => handleContainerFieldChange('twentyft', 'preferableRate', text)}
                    keyboardType="numeric"
                    className="w-full"
                  />
                </View>
                <View className="w-full gap-2">
                  <Label>Containers Per Month (20ft)</Label>
                  <Input
                    placeholder="Enter containers per month"
                    value={formData.extra_info.twentyft.containersPerMonth}
                    onChangeText={(text) => handleContainerFieldChange('twentyft', 'containersPerMonth', text)}
                    keyboardType="numeric"
                    className="w-full"
                  />
                </View>
                <View className="w-full gap-2">
                  <Label>Free Ground Rent Days (20ft)</Label>
                  <Input
                    placeholder="Enter free ground rent days"
                    value={formData.extra_info.twentyft.freeGroundRentDays}
                    onChangeText={(text) => handleContainerFieldChange('twentyft', 'freeGroundRentDays', text)}
                    keyboardType="numeric"
                    className="w-full"
                  />
                </View>
              </View>
            )}

            {/* 40ft Checkbox */}
            <View className="flex-row items-center gap-3 p-3 border border-border rounded-lg">
              <Checkbox
                checked={formData.extra_info.fortyft.clicked}
                onCheckedChange={(checked) => handleContainerCheckbox('fortyft', checked as boolean)}
              />
              <Text className="flex-1 text-base font-medium">40ft Container</Text>
            </View>

            {/* 40ft Fields - Show when checked */}
            {formData.extra_info.fortyft.clicked && (
              <View className="ml-4 gap-3 p-3 bg-muted rounded-lg">
                <View className="w-full gap-2">
                  <Label>Preferable Rate (40ft)</Label>
                  <Input
                    placeholder="Enter preferable rate"
                    value={formData.extra_info.fortyft.preferableRate}
                    onChangeText={(text) => handleContainerFieldChange('fortyft', 'preferableRate', text)}
                    keyboardType="numeric"
                    className="w-full"
                  />
                </View>
                <View className="w-full gap-2">
                  <Label>Containers Per Month (40ft)</Label>
                  <Input
                    placeholder="Enter containers per month"
                    value={formData.extra_info.fortyft.containersPerMonth}
                    onChangeText={(text) => handleContainerFieldChange('fortyft', 'containersPerMonth', text)}
                    keyboardType="numeric"
                    className="w-full"
                  />
                </View>
                <View className="w-full gap-2">
                  <Label>Free Ground Rent Days (40ft)</Label>
                  <Input
                    placeholder="Enter free ground rent days"
                    value={formData.extra_info.fortyft.freeGroundRentDays}
                    onChangeText={(text) => handleContainerFieldChange('fortyft', 'freeGroundRentDays', text)}
                    keyboardType="numeric"
                    className="w-full"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View className="w-full pt-4 pb-8">
            <Button
              onPress={handleSubmitPricingRequest}
              className="w-full"
              disabled={!isFormValid() || submitting}
            >
              {submitting ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="white" />
                  <Text>Submitting...</Text>
                </View>
              ) : (
                <Text>Submit Pricing Request</Text>
              )}
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
