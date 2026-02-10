import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from "@/components/ui/select";
import { getServiceProviders } from "@/lib/actions/providers/fetch";
import { get3plOrderById, update3plOrder } from "@/lib/actions/3pl/fetch";
import type { ThreePlOrderRecord } from "@/lib/actions/3pl/createOrder";
import LoadingView from "@/components/LoadingView";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft } from "lucide-react-native";

export default function ThreePlOrderEditPage() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<ThreePlOrderRecord | null>(null);
  const [providerOptions, setProviderOptions] = useState<Option[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [igmNo, setIgmNo] = useState("");
  const [blNo, setBlNo] = useState("");
  const [itemNo, setItemNo] = useState("");
  const [consigneeName, setConsigneeName] = useState("");
  const [chaName, setChaName] = useState("");
  const [containersInput, setContainersInput] = useState("");

  useEffect(() => {
    if (!orderId) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      const [orderRes, providersRes] = await Promise.all([
        get3plOrderById(orderId),
        getServiceProviders({ serviceTitle: "3PL" }),
      ]);
      if (!mounted) return;
      if (orderRes.success && orderRes.output) {
        const o = orderRes.output;
        setOrder(o);
        setIgmNo(o.igmNo || "");
        setBlNo(o.blNo || "");
        setItemNo(o.itemNo || "");
        setConsigneeName(o.consigneeName || "");
        setChaName(o.chaName || "");
        setSelectedProviderId(o.provider || "");
        setContainersInput(Array.isArray((o as any).containers) ? ((o as any).containers as string[]).join(", ") : "");
      } else {
        Alert.alert("Error", orderRes.message || "Failed to load order");
      }
      if (providersRes.success && providersRes.output) {
        setProviderOptions(
          (providersRes.output || []).map((p) => ({ value: p.id, label: p.title || p.id }))
        );
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const handleSave = async () => {
    if (!orderId) return;
    const containers = containersInput
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    setSaving(true);
    try {
      const res = await update3plOrder(orderId, {
        provider: selectedProviderId || undefined,
        igmNo: igmNo.trim() || undefined,
        blNo: blNo.trim() || undefined,
        itemNo: itemNo.trim() || undefined,
        consigneeName: consigneeName.trim() || undefined,
        chaName: chaName.trim() || undefined,
        containers: containers.length > 0 ? containers : undefined,
      } as any);
      if (!res.success) {
        Alert.alert("Error", res.message);
        return;
      }
      Alert.alert("Success", res.message, [
        { text: "OK", onPress: () => router.replace("/(protected)/orders/3pl/order") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to update order.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingView LoadingText="Loading..." />;
  }

  if (!order) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Edit 3PL Order",
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
            <CardTitle>Order #{String(orderId).slice(0, 8)}</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View>
              <Label>Provider</Label>
              <Select value={selectedProviderId} onValueChange={(v) => setSelectedProviderId(v || "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {providerOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value} label={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>
            <View>
              <Label>IGM No</Label>
              <Input value={igmNo} onChangeText={setIgmNo} placeholder="IGM number" />
            </View>
            <View>
              <Label>BL No</Label>
              <Input value={blNo} onChangeText={setBlNo} placeholder="BL number" />
            </View>
            <View>
              <Label>Item No</Label>
              <Input value={itemNo} onChangeText={setItemNo} placeholder="Item number" />
            </View>
            <View>
              <Label>Consignee Name</Label>
              <Input value={consigneeName} onChangeText={setConsigneeName} placeholder="Consignee name" />
            </View>
            <View>
              <Label>CHA Name</Label>
              <Input value={chaName} onChangeText={setChaName} placeholder="CHA name" />
            </View>
            <View>
              <Label>Containers (comma or space separated)</Label>
              <Input
                value={containersInput}
                onChangeText={setContainersInput}
                placeholder="e.g. ABCD1234567, ABCD7654321"
              />
            </View>
          </CardContent>
          <CardFooter>
            <Button onPress={handleSave} disabled={saving} className="w-full">
              <Text>{saving ? "Saving…" : "Save"}</Text>
            </Button>
          </CardFooter>
        </Card>
      </ScrollView>
    </>
  );
}
