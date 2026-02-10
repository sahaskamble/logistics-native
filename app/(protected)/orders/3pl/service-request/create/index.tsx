import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft } from "lucide-react-native";
import { list3plOrdersForCurrentUser } from "@/lib/actions/3pl/fetch";
import { create3plRequestByServiceTypeTitle } from "@/lib/actions/3pl/genericServiceRequest";
import LoadingView from "@/components/LoadingView";

export default function ThreePlServiceRequestCreatePage() {
  const { serviceTypeTitle } = useLocalSearchParams<{ serviceTypeTitle: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<{ id: string; igmNo?: string; blNo?: string; itemNo?: string }[]>([]);
  const [orderOptions, setOrderOptions] = useState<Option[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [customerRemarks, setCustomerRemarks] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await list3plOrdersForCurrentUser();
      if (!mounted) return;
      if (res.success && res.output) {
        setOrders(res.output);
        setOrderOptions(
          res.output.map((o) => ({
            value: o.id,
            label: o.igmNo || o.blNo || o.itemNo || `Order #${o.id.slice(0, 8)}`,
          }))
        );
        if (res.output[0]?.id) setSelectedOrderId(res.output[0].id);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!selectedOrderId) {
      Alert.alert("Error", "Please select an order.");
      return;
    }
    if (!serviceTypeTitle) {
      Alert.alert("Error", "Service type is missing.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await create3plRequestByServiceTypeTitle({
        serviceTypeTitle,
        orderId: selectedOrderId,
        customerRemarks: customerRemarks.trim() || undefined,
      });
      if (!res.success) {
        Alert.alert("Error", res.message);
        return;
      }
      Alert.alert("Success", res.message, [
        { text: "OK", onPress: () => router.replace("/(protected)/orders/3pl/service-request") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to create request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingView LoadingText="Loading orders..." />;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: serviceTypeTitle ? `New ${serviceTypeTitle} Request` : "New Service Request",
          headerLeft: () => (
            <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-full mr-2">
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background">
        <Card className="m-4">
          <CardHeader>
            <CardTitle>Service request details</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View>
              <Label>3PL Order *</Label>
              <Select value={selectedOrderId} onValueChange={(v) => setSelectedOrderId(v || "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {orderOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value} label={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>
            <View>
              <Label>Remarks</Label>
              <Input
                value={customerRemarks}
                onChangeText={setCustomerRemarks}
                placeholder="Optional remarks"
                multiline
                numberOfLines={3}
              />
            </View>
          </CardContent>
          <CardFooter>
            <Button onPress={handleSubmit} disabled={submitting || !selectedOrderId} className="w-full">
              <Text>{submitting ? "Submitting…" : "Submit Request"}</Text>
            </Button>
          </CardFooter>
        </Card>
      </ScrollView>
    </>
  );
}
