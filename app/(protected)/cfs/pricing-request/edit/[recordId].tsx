import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import LoadingView from "@/components/LoadingView";

import { getCfsPricingRequestById, updateCfsPricingRequest } from "@/lib/actions/cfs/pricingRequest";
import type { CfsPricingRequestRecord } from "@/lib/actions/cfs/pricingRequest";

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

type ExtraInfoForm = {
  twentyft: { clicked: boolean; preferableRate: string; containersPerMonth: string; freeGroundRentDays: string };
  fortyft: { clicked: boolean; preferableRate: string; containersPerMonth: string; freeGroundRentDays: string };
};

function defaultExtraInfo(): ExtraInfoForm {
  return {
    twentyft: { clicked: false, preferableRate: "", containersPerMonth: "", freeGroundRentDays: "" },
    fortyft: { clicked: false, preferableRate: "", containersPerMonth: "", freeGroundRentDays: "" },
  };
}

function extraInfoFromRecord(record: CfsPricingRequestRecord | null): ExtraInfoForm {
  if (!record?.extra_info) return defaultExtraInfo();
  const ei = record.extra_info;
  return {
    twentyft: {
      clicked: !!ei.twentyft?.clicked,
      preferableRate: ei.twentyft?.preferableRate ?? "",
      containersPerMonth: ei.twentyft?.containersPerMonth ?? ei.twentyft?.containerPerMonths ?? "",
      freeGroundRentDays: ei.twentyft?.freeGroundRentDays ?? ei.twentyft?.groundrentFreeDays ?? "",
    },
    fortyft: {
      clicked: !!ei.fortyft?.clicked,
      preferableRate: ei.fortyft?.preferableRate ?? "",
      containersPerMonth: ei.fortyft?.containersPerMonth ?? ei.fortyft?.containerPerMonths ?? "",
      freeGroundRentDays: ei.fortyft?.freeGroundRentDays ?? ei.fortyft?.groundrentFreeDays ?? "",
    },
  };
}

function toApiExtraInfo(form: ExtraInfoForm): CfsPricingRequestRecord["extra_info"] {
  return {
    twentyft: {
      agreedAmount: "",
      billingAmount: "",
      clicked: form.twentyft.clicked,
      containerPerMonths: form.twentyft.containersPerMonth || "",
      freeGroundRentDays: form.twentyft.freeGroundRentDays || "",
      groundrentFreeDays: "",
      preferableRate: form.twentyft.preferableRate || "",
    },
    fortyft: {
      agreedAmount: "",
      billingAmount: "",
      clicked: form.fortyft.clicked,
      containerPerMonths: form.fortyft.containersPerMonth || "",
      freeGroundRentDays: form.fortyft.freeGroundRentDays || "",
      groundrentFreeDays: "",
      preferableRate: form.fortyft.preferableRate || "",
    },
  };
}

export default function CfsPricingRequestEditPage() {
  const { recordId } = useLocalSearchParams<{ recordId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState<CfsPricingRequestRecord | null>(null);
  const [containerType, setContainerType] = useState<Option | undefined>();
  const [delayType, setDelayType] = useState<Option | undefined>();
  const [reason, setReason] = useState("");
  const [extraInfo, setExtraInfo] = useState<ExtraInfoForm>(defaultExtraInfo());

  const load = useCallback(async () => {
    if (!recordId) return;
    setLoading(true);
    const res = await getCfsPricingRequestById(recordId, { expand: "serviceProvider" });
    if (!res.success) {
      Alert.alert("Error", res.message);
      setRecord(null);
    } else {
      const r = res.output!;
      setRecord(r);
      setContainerType(r.containerType ? { value: r.containerType, label: r.containerType } : undefined);
      setDelayType(r.delayType ? { value: r.delayType, label: r.delayType } : undefined);
      setReason(r.reason ?? "");
      setExtraInfo(extraInfoFromRecord(r));
    }
    setLoading(false);
  }, [recordId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleContainerCheckbox = (key: "twentyft" | "fortyft", checked: boolean) => {
    setExtraInfo((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        clicked: checked,
        ...(checked ? {} : { preferableRate: "", containersPerMonth: "", freeGroundRentDays: "" }),
      },
    }));
  };

  const handleContainerFieldChange = (key: "twentyft" | "fortyft", field: keyof ExtraInfoForm["twentyft"], value: string) => {
    if (field === "clicked") return;
    setExtraInfo((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const save = async () => {
    if (!recordId) return;
    setSaving(true);
    try {
      const res = await updateCfsPricingRequest({
        requestId: recordId,
        containerType: containerType?.value as CfsPricingRequestRecord["containerType"],
        delayType: delayType?.value as CfsPricingRequestRecord["delayType"],
        reason: reason.trim() || undefined,
        extra_info: toApiExtraInfo(extraInfo),
      });
      if (!res.success) {
        Alert.alert("Error", res.message);
        return;
      }
      Alert.alert("Success", res.message);
      router.replace(`/(protected)/cfs/pricing-request/view/${recordId}` as any);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingView LoadingText="Loading request..." />;
  if (!record) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Request not found</Text>
      </View>
    );
  }

  const providerName = (record as any).expand?.serviceProvider?.title || record.serviceProvider || "—";

  return (
    <>
      <Stack.Screen
        options={{
          title: `Edit ${record.id}`,
          headerLeft: () => (
            <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-full mr-2">
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit Pricing Request</CardTitle>
              <Text className="text-sm text-muted-foreground">Provider: {providerName}</Text>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="gap-2">
                <Label>Container Type</Label>
                <Select value={containerType} onValueChange={setContainerType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Container Type" />
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
              <View className="gap-2">
                <Label>Delay Type</Label>
                <Select value={delayType} onValueChange={setDelayType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Delay Type" />
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
              <View className="gap-2">
                <Label>Reason (optional)</Label>
                <Input value={reason} onChangeText={setReason} placeholder="Reason or notes" multiline numberOfLines={3} className="min-h-20" />
              </View>

              <View className="gap-2">
                <Label>20ft Container</Label>
                <View className="flex-row items-center gap-3 p-3 border border-border rounded-lg">
                  <Checkbox checked={extraInfo.twentyft.clicked} onCheckedChange={(c) => handleContainerCheckbox("twentyft", c as boolean)} />
                  <Text className="flex-1 font-medium">Include 20ft</Text>
                </View>
                {extraInfo.twentyft.clicked && (
                  <View className="ml-4 gap-3 p-3 bg-muted rounded-lg">
                    <View className="gap-2">
                      <Label>Preferable Rate</Label>
                      <Input
                        placeholder="Rate"
                        value={extraInfo.twentyft.preferableRate}
                        onChangeText={(t) => handleContainerFieldChange("twentyft", "preferableRate", t)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View className="gap-2">
                      <Label>Containers Per Month</Label>
                      <Input
                        placeholder="Count"
                        value={extraInfo.twentyft.containersPerMonth}
                        onChangeText={(t) => handleContainerFieldChange("twentyft", "containersPerMonth", t)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View className="gap-2">
                      <Label>Free Ground Rent Days</Label>
                      <Input
                        placeholder="Days"
                        value={extraInfo.twentyft.freeGroundRentDays}
                        onChangeText={(t) => handleContainerFieldChange("twentyft", "freeGroundRentDays", t)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                )}
              </View>

              <View className="gap-2">
                <Label>40ft Container</Label>
                <View className="flex-row items-center gap-3 p-3 border border-border rounded-lg">
                  <Checkbox checked={extraInfo.fortyft.clicked} onCheckedChange={(c) => handleContainerCheckbox("fortyft", c as boolean)} />
                  <Text className="flex-1 font-medium">Include 40ft</Text>
                </View>
                {extraInfo.fortyft.clicked && (
                  <View className="ml-4 gap-3 p-3 bg-muted rounded-lg">
                    <View className="gap-2">
                      <Label>Preferable Rate</Label>
                      <Input
                        placeholder="Rate"
                        value={extraInfo.fortyft.preferableRate}
                        onChangeText={(t) => handleContainerFieldChange("fortyft", "preferableRate", t)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View className="gap-2">
                      <Label>Containers Per Month</Label>
                      <Input
                        placeholder="Count"
                        value={extraInfo.fortyft.containersPerMonth}
                        onChangeText={(t) => handleContainerFieldChange("fortyft", "containersPerMonth", t)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View className="gap-2">
                      <Label>Free Ground Rent Days</Label>
                      <Input
                        placeholder="Days"
                        value={extraInfo.fortyft.freeGroundRentDays}
                        onChangeText={(t) => handleContainerFieldChange("fortyft", "freeGroundRentDays", t)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                )}
              </View>

              <Button className="w-full" onPress={save} disabled={saving}>
                {saving ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="white" />
                    <Text>Saving...</Text>
                  </View>
                ) : (
                  <Text>Save Changes</Text>
                )}
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </>
  );
}
