import { useLocalSearchParams, useRouter } from 'expo-router';
import { Modal, ScrollView, View, ActivityIndicator, Alert, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { getCfsOrderById, updateCfsOrder, type CfsOrderRecord } from '@/lib/actions/cfs/fetch';
import { listContainersForCurrentUser, UserContainer } from '@/lib/actions/cfs/createOrder';
import { Separator } from '@/components/ui/separator';

export default function EditOrderPage() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<CfsOrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allContainers, setAllContainers] = useState<UserContainer[]>([]);

  // Form states
  const [igmNo, setIgmNo] = useState('');
  const [itemNo, setItemNo] = useState('');
  const [blNo, setBlNo] = useState('');
  const [consigneeName, setConsigneeName] = useState('');
  const [chaName, setChaName] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]); // Array of container IDs
  const [containerPickerOpen, setContainerPickerOpen] = useState(false);
  const [containerSearch, setContainerSearch] = useState('');

  const formattedEta = useMemo(() => {
    const eta = (order as any)?.eta;
    if (!eta) return 'N/A';
    try {
      const d = new Date(eta);
      if (Number.isNaN(d.getTime())) return 'N/A';
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  }, [order]);

  const formattedDpdType = useMemo(() => {
    const v = (order as any)?.dpdType;
    if (!v) return 'N/A';
    return String(v);
  }, [order]);

  useEffect(() => {
    async function loadData() {
      if (!orderId) return;

      // Fetch order
      const res = await getCfsOrderById(orderId);
      if (res.success && res.output) {
        const ord = res.output.order;
        setOrder(ord);
        setIgmNo(ord.igmNo || '');
        setItemNo(ord.itemNo || '');
        setBlNo(ord.blNo || '');
        setConsigneeName(ord.consigneeName || '');
        setChaName(ord.chaName || '');
        setOrderDescription(ord.orderDescription || '');
        setSelectedContainers(ord.containers || []); // Assume 'containers' is array of IDs
      } else {
        Alert.alert('Error', res.message || 'Failed to load order');
      }

      // Fetch all containers
      const containersRes = await listContainersForCurrentUser(); // Implement this: returns { success, output: [{id, containerNo}] }
      if (containersRes.success) {
        setAllContainers(containersRes.output || []);
      }

      setLoading(false);
    }
    loadData();
  }, [orderId]);

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);

    const updatedData: Partial<CfsOrderRecord> = {
      igmNo,
      itemNo,
      blNo,
      consigneeName,
      chaName,
      orderDescription,
      containers: selectedContainers,
    };

    const res = await updateCfsOrder(orderId, updatedData); // Implement this function in fetch.ts
    setSaving(false);

    if (res.success) {
      Alert.alert('Success', 'Order updated');
      router.back(); // Or navigate to view page
    } else {
      Alert.alert('Error', res.message || 'Failed to update order');
    }
  };

  const addContainer = (containerId: string) => {
    if (!selectedContainers.includes(containerId)) {
      setSelectedContainers([...selectedContainers, containerId]);
    }
  };

  const removeContainer = (containerId: string) => {
    setSelectedContainers(selectedContainers.filter(id => id !== containerId));
  };

  const availableContainers = useMemo(() => {
    const available = allContainers.filter((c) => !selectedContainers.includes(c.id));
    const q = containerSearch.trim().toLowerCase();
    if (!q) return available;
    return available.filter((c) => (c.containerNo || '').toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [allContainers, containerSearch, selectedContainers]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-lg">Loading order...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-muted-foreground">Order not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `Edit Order #${order.id}` }} />

      <ScrollView
        className="flex-1"
      >
        <View className='px-2 p-4'>
          <Card>
            <CardHeader>
              <CardTitle>Edit Order Details</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">ETA</Text>
                  <Text className="text-sm font-medium">{formattedEta}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">DPD Type</Text>
                  <Text className="text-sm font-medium">{formattedDpdType}</Text>
                </View>
              </View>

              <View>
                <Text className="text-sm text-muted-foreground mb-1">IGM Number</Text>
                <Input value={igmNo} onChangeText={setIgmNo} placeholder="Enter IGM Number" />
              </View>

              <View>
                <Text className="text-sm text-muted-foreground mb-1">Item Number</Text>
                <Input value={itemNo} onChangeText={setItemNo} placeholder="Enter Item Number" />
              </View>

              <View>
                <Text className="text-sm text-muted-foreground mb-1">BL Number</Text>
                <Input value={blNo} onChangeText={setBlNo} placeholder="Enter BL Number" />
              </View>

              <View>
                <Text className="text-sm text-muted-foreground mb-1">Consignee Name</Text>
                <Input value={consigneeName} onChangeText={setConsigneeName} placeholder="Enter Consignee Name" />
              </View>

              <View>
                <Text className="text-sm text-muted-foreground mb-1">CHA Name</Text>
                <Input value={chaName} onChangeText={setChaName} placeholder="Enter CHA Name" />
              </View>

              <View>
                <Text className="text-sm text-muted-foreground mb-1">Order Description</Text>
                <Input value={orderDescription} onChangeText={setOrderDescription} placeholder="Enter Description" multiline numberOfLines={4} />
              </View>

              <View>
                <Text className="text-sm text-muted-foreground mb-1">Containers</Text>
                {/* Selected Containers */}
                {selectedContainers.length === 0 && (
                  <Text className="text-sm text-muted-foreground">N/A</Text>
                )}
                {selectedContainers.map(id => {
                  const container = allContainers.find(c => c.id === id);
                  const label = container?.containerNo || id;
                  return (
                    <View key={id} className="flex-row items-center justify-between bg-muted p-3 rounded-md mb-2">
                      <Text numberOfLines={1} className="flex-1 mr-3">{label}</Text>
                      <Pressable onPress={() => removeContainer(id)}>
                        <Icon as={X} className="size-5 text-destructive" />
                      </Pressable>
                    </View>
                  );
                })}

                {/* Add New Container */}
                <Button variant="outline" onPress={() => setContainerPickerOpen(true)}>
                  <Text>Add container</Text>
                </Button>

                <Modal
                  visible={containerPickerOpen}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setContainerPickerOpen(false)}
                >
                  <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-background rounded-t-2xl p-4 max-h-[80%]">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-lg font-semibold">Select container</Text>
                        <Pressable
                          onPress={() => {
                            setContainerPickerOpen(false);
                            setContainerSearch('');
                          }}
                        >
                          <Icon as={X} className="size-6 text-muted-foreground" />
                        </Pressable>
                      </View>

                      <View className="mt-3">
                        <Input
                          placeholder="Search container number"
                          value={containerSearch}
                          onChangeText={setContainerSearch}
                          clearButtonMode="while-editing"
                          autoCapitalize="characters"
                        />
                        <Text className="text-xs text-muted-foreground mt-2">
                          {availableContainers.length} available
                        </Text>
                      </View>

                      <ScrollView className="mt-3">
                        {availableContainers.map((c) => (
                          <Pressable
                            key={c.id}
                            className="py-3 border-b border-border"
                            onPress={() => {
                              addContainer(c.id);
                              setContainerPickerOpen(false);
                              setContainerSearch('');
                            }}
                          >
                            <Text className="font-medium">{c.containerNo}</Text>
                            <Text className="text-xs text-muted-foreground">{c.id}</Text>
                          </Pressable>
                        ))}

                        {availableContainers.length === 0 && (
                          <View className="py-6 items-center">
                            <Text className="text-muted-foreground">No containers found</Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  </View>
                </Modal>
              </View>
            </CardContent>
          </Card>

          <Button className="mt-6" onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="white" /> : <Text>Save Changes</Text>}
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

function InfoRow({ icon: IconComponent, label, value }: { icon?: any; label: string; value?: string | null }) {
  if (!value) value = '-';
  return (
    <>
      <View className="flex-row items-center gap-3">
        {IconComponent && <Icon as={IconComponent} className="size-5 text-muted-foreground" />}
        <View className="flex-1">
          <Text className="text-sm text-muted-foreground">{label}</Text>
          <Text className="text-base font-medium">{value}</Text>
        </View>
      </View>
      <Separator className="my-2" />
    </>
  );
}
