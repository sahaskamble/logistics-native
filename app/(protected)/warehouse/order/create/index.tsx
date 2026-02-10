import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from "@/components/ui/select";
import { getServiceProviders } from "@/lib/actions/providers/fetch";
import { createWarehouseOrder } from "@/lib/actions/warehouse/createOrder";
import LoadingView from "@/components/LoadingView";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft } from "lucide-react-native";

export default function WarehouseOrderCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [providers, setProviders] = useState<{ id: string; title?: string }[]>([]);
  const [providerOptions, setProviderOptions] = useState<Option[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [igmNo, setIgmNo] = useState("");
  const [blNo, setBlNo] = useState("");
  const [itemNo, setItemNo] = useState("");
  const [consigneeName, setConsigneeName] = useState("");
  const [chaName, setChaName] = useState("");
  const [containersInput, setContainersInput] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await getServiceProviders({ serviceTitle: "Warehouse" });
      if (!mounted) return;
      if (!res.success) {
        Alert.alert("Error", res.message);
        setProviders([]);
      } else {
        setProviders(res.output || []);
        setProviderOptions(
          (res.output || []).map((p) => ({ value: p.id, label: p.title || p.id }))
        );
        if ((res.output || [])[0]?.id) setSelectedProviderId((res.output || [])[0].id);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    const containers = containersInput
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    setSubmitting(true);
    try {
      const res = await createWarehouseOrder({
        provider: selectedProviderId || undefined,
        igmNo: igmNo.trim() || undefined,
        blNo: blNo.trim() || undefined,
        itemNo: itemNo.trim() || undefined,
        consigneeName: consigneeName.trim() || undefined,
        chaName: chaName.trim() || undefined,
        containers: containers.length > 0 ? containers : undefined,
      });
      if (!res.success) {
        Alert.alert("Error", res.message);
        return;
      }
      Alert.alert("Success", res.message, [
        { text: "OK", onPress: () => router.replace("/(protected)/warehouse/order") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingView LoadingText="Loading..." />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "New Warehouse Order",
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
            <CardTitle>Order details</CardTitle>
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
                    <SelectItem key={o.value} value={o.value} label={o.label}>{o.label}</SelectItem>
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
            <Button onPress={handleSubmit} disabled={submitting} className="w-full">
              <Text>{submitting ? "Creating…" : "Create Order"}</Text>
            </Button>
          </CardFooter>
        </Card>
      </ScrollView>
    </>
  );
}
