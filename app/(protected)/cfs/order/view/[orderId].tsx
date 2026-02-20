import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View, ActivityIndicator, Alert, Pressable, Image, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import {
  Container,
  Ship,
  Truck,
  Calendar,
  FileText,
  Package,
  User,
  Building,
  ClipboardCheck,
  Clock,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowLeft,
  Ticket,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { getCfsOrderById, type CfsOrderRecord } from '@/lib/actions/cfs/fetch';
import { Modal } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Zoomable } from '@likashefqet/react-native-image-zoom';
import { Button } from '@/components/ui/button';
// import { ModifierKey } from '@shopify/react-native-skia';

function getStatusConfig(status?: CfsOrderRecord['status']) {
  switch (status) {
    case 'Pending':
      return { variant: 'default' as const, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
    case 'Accepted':
      return { variant: 'secondary' as const, icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500' };
    case 'In Progress':
      return { variant: 'secondary' as const, icon: AlertCircle, color: 'text-blue-500', bgColor: 'bg-gray-400' };
    case 'Rejected':
      return { variant: 'destructive' as const, icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500' };
    case 'Completed':
      return { variant: 'outline' as const, icon: ClipboardCheck, color: 'text-green-600', bgColor: 'bg-blue-500' };
    default:
      return { variant: 'outline' as const, icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted-background' };
  }
}

export default function OrderDetailPage() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<CfsOrderRecord | null>(null);
  const [documents, setDocuments] = useState<{ field: string, name: string, url: string }[]>([]);
  const [authHeader, setAuthHeader] = useState<string>("")
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [initialIndex, setInitialIndex] = useState<number>(0);
  const screenWidth = Dimensions.get('window');

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      const res = await getCfsOrderById(orderId, {
        expand: "customer",
      });
      if (res.success && res.output) {
        setOrder(res.output.order);
        setDocuments(res.output.documents);
        setAuthHeader(res.output.authHeader);
        // console.warn("Documents", res.output.documents);
        console.log("Orders Container", res.output.order?.containers);
      } else {
        Alert.alert('Error', res.message || 'Failed to load order');
      }
      setLoading(false);
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-lg">Loading order details...</Text>
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

  const statusConfig = getStatusConfig(order.status);

  const formattedEta = (() => {
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
  })();

  const dpdTypeValue = order.dpdType ? String(order.dpdType) : 'N/A';

  const containersValue = (() => {
    const containers = (order as any)?.containers as unknown;
    if (!containers) return 'N/A';
    if (Array.isArray(containers) && containers.length > 0) return containers.join(', ');
    if (typeof containers === 'string' && containers.trim()) return containers;
    return 'N/A';
  })();

  const isImageFile = (filename: any): boolean => {
    if (!filename) return false;
    if (typeof filename !== 'string') return false;
    const lower = filename.toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => lower.endsWith(ext));
  };

  const imageDocs = documents.filter(doc => isImageFile(doc?.name));

  const otherDocs = documents.filter(doc => !isImageFile(doc?.name) && doc?.name);

  console.log("Customer name", order.expand);

  return (
    <>
      <Stack.Screen
        options={{
          title: `Order #${order.id}`,
          headerLeft: () => (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.back()}
              className="rounded-full mr-2"
            >
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />

      <ScrollView className="flex-1 bg-background">
        {/* Header with Status */}
        <View className="bg-primary/10 p-6">
          <Text className="text-2xl font-bold">Order #{order.id}</Text>
          <View className="flex-row items-center gap-3 mt-3">
            <Icon as={statusConfig.icon} className={`${statusConfig.color} size-6`} />
            <Badge variant={statusConfig.variant} className={`${statusConfig.bgColor}`}>
              <Text>{order.status || 'Unknown'}</Text>
            </Badge>
          </View>
        </View>

        <View className="p-4 gap-6">
          {/* Support ticket for this order */}
          <Button
            variant="outline"
            onPress={() =>
              router.push(
                `/(protected)/support/create?orderId=${encodeURIComponent(order.id)}` as any
              )
            }
            className="flex-row items-center gap-2"
          >
            <Icon as={Ticket} size={18} />
            <Text>Create support ticket for this order</Text>
          </Button>

          {/* Basic Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex-row items-center gap-2">
                <Package className="size-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <InfoRow icon={User} label="Created By" value={order.expand?.customer.name} />
              <InfoRow icon={FileText} label="Description" value={order.orderDescription} />
              <InfoRow icon={Building} label="Consignee" value={order.consigneeName} />
              <InfoRow icon={User} label="CHA Name" value={order.chaName} />
            </CardContent>
          </Card>

          {/* Shipping Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex-row items-center gap-2">
                <Ship className="size-5" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <InfoRow icon={Container} label="BL No." value={order.blNo} />
              <InfoRow icon={Container} label="IGM No." value={order.igmNo} />
              <InfoRow icon={Package} label="Item No." value={order.itemNo} />
              <InfoRow icon={Truck} label="Shipping Line" value={order.shipping_line} />
              <InfoRow icon={Calendar} label="ETA" value={formattedEta} />
              <InfoRow icon={Container} label="Containers" value={containersValue} />
            </CardContent>
          </Card>

          {/* Delivery Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex-row items-center gap-2">
                <Truck className="size-5" />
                Delivery Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <InfoRow label="DPD Type" value={dpdTypeValue} />
              <InfoRow label="Delivery Type" value={order.deliveryType} />
            </CardContent>
          </Card>

          {/* Attachments / Documents */}
          {(imageDocs.length > 0 || otherDocs.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex-row items-center gap-2">
                  <FileText className="size-5" />
                  Attached Documents ({documents.length})
                </CardTitle>
              </CardHeader>

              <CardContent className="gap-6">
                {/* Images Gallery */}
                {imageDocs.length > 0 && (
                  <View>
                    <Text className="text-base font-medium mb-3">Images</Text>
                    <View className="flex-row flex-wrap gap-3">
                      {imageDocs.map((doc, index: number) => (
                        <Pressable
                          key={doc.url}
                          className="w-full h-40 rounded-lg overflow-hidden border border-border"
                          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                          onPress={() => {
                            setInitialIndex(index);
                            setModalVisible(true);
                          }}
                        >
                          <Image
                            source={{ uri: doc.url, headers: { Authorization: authHeader } }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {/* Other Files */}
                {otherDocs.length > 0 && (
                  <View>
                    <Text className="text-base font-medium mb-3">Other Files</Text>
                    {otherDocs.map((doc) => (
                      <Pressable
                        key={doc.url}
                        className="flex-row items-center gap-3 py-3 px-4 bg-muted/50 rounded-lg mb-2"
                        onPress={() => {
                          // You can open in browser or use expo-file-system to download
                          Alert.alert('File', doc.name);
                        }}
                      >
                        <Icon as={FileText} className="size-6 text-primary" />
                        <Text className="flex-1 text-sm font-medium">{doc.name}</Text>
                        <Icon as={Download} className="size-5 text-muted-foreground" />
                      </Pressable>
                    ))}
                  </View>
                )}
              </CardContent>
            </Card>
          )}
        </View>
        <Modal
          visible={modalVisible}
          style={{ margin: 0 }} // Full-screen
          backdropColor="#000"
          statusBarTranslucent={true}
        >
          <View className="flex-1 bg-black/60">
            <Carousel
              width={screenWidth.width}
              height={screenWidth.height}
              data={imageDocs}
              defaultIndex={initialIndex}
              mode="parallax" // Optional: nice parallax effect
              modeConfig={{
                parallaxScrollingScale: 0.9,
                parallaxScrollingOffset: 50,
              }}
              pagingEnabled
              snapEnabled
              loop={false}
              renderItem={({ item: doc, index }) => (
                <Zoomable
                  key={index}
                  minScale={1}
                  maxScale={5}
                  doubleTapScale={3}
                  isDoubleTapEnabled
                  isSingleTapEnabled
                  isPanEnabled
                  isPinchEnabled
                  onSingleTap={() => setModalVisible(false)} // Close on single tap
                  style={{ width: screenWidth, height: '100%' }}
                >
                  <Image
                    source={{ uri: doc.url, headers: { Authorization: authHeader } }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode='contain'
                  />
                </Zoomable>
              )}
            />
          </View>
        </Modal>
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
