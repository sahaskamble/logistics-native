import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View, ActivityIndicator, Image, Dimensions } from "react-native";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Star,
  User,
  FileText,
  Building2,
  CheckCircle2,
  DollarSign,
  Clock,
  Car
} from "lucide-react-native";
import { useEffect, useState, Fragment } from "react";
import pb from "@/lib/pocketbase/pb";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import LoadingView from "@/components/LoadingView";

type ServiceProvider = {
  id: string;
  title?: string;
  description?: string;
  verified?: boolean;
  rating?: number;
  files?: string[];
  location?: string;
  contact?: string;
  service?: string[];
  features?: any;
  tags?: any;
  tariffRates?: number;
  freeDays?: number;
  monthlyDues?: number;
  DocumentationCharges?: number;
  InsuranceCharges?: number;
  NoOfVehicles?: number;
  TypesOfVehicles?: any;
  bonded?: boolean;
  general?: boolean;
  created?: string;
  updated?: string;
  expand?: any;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DetailsPage() {
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<ServiceProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setDetails(null);

    const fetchDetails = async () => {
      console.log(
        "Slug",
        providerId
      )
      if (!providerId) {
        setError("No provider ID provided");
        setLoading(false);
        return;
      }

      try {

        const collection = "service_provider";

        try {
          const record = await pb.collection(collection).getOne(providerId, {
            expand: "service,author",
          });
          setDetails(record as ServiceProvider);
          setLoading(false);
        } catch (err: any) {
          if (err?.status === 404) {
            setError("Service provider not found");
          } else {
            console.error(`Error fetching from ${collection}:`, err);
            setError(err?.message || "Failed to fetch service provider details");
          }
          setLoading(false);
        }
      } catch (error: any) {
        console.error("Error fetching service provider details:", error);
        setError(error?.message || "Failed to fetch service provider details");
        setLoading(false);
      }
    };

    fetchDetails();
  }, [providerId]);

  if (loading || details?.id !== providerId) {
    return (
      <LoadingView LoadingText="Loading provider details..." />
    );
  }

  if (error || details === null) {
    return (
      <View className="flex-1 items-center justify-center px-4 bg-background">
        <Icon as={Building2} size={48} className="text-muted-foreground mb-4" />
        <Text className="text-xl font-semibold mb-2 text-foreground">Provider Not Found</Text>
        <Text className="text-muted-foreground text-center mb-4">
          {error || "The requested service provider could not be found."}
        </Text>
        <Button onPress={() => router.push('/home')}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background pb-4">
      <View className="p-4 gap-3">
        <Fragment>
          {/* Image Gallery */}
          {details.files && details.files.length > 0 && (
            <Card className="p-0 overflow-hidden mb-2">
              <AspectRatio ratio={16 / 9}>
                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                  {details.files.map((file: string, idx: number) => (
                    <View key={idx} style={{ width: SCREEN_WIDTH - 32, height: "100%" }}>
                      <Image
                        source={{ uri: pb.files.getURL(details as any, file) }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </ScrollView>
              </AspectRatio>
            </Card>
          )}

          {/* Main Info Card */}
          <Card className="p-4">
            <View className="gap-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-2xl font-semibold">{details.title || "Unnamed Provider"}</Text>
                  <Text className="text-sm text-muted-foreground mt-1">Provider ID: {details.id}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  {details.verified && (
                    <View className="px-2 py-1 rounded-full bg-green-500/10 flex-row items-center gap-1">
                      <Icon as={CheckCircle2} size={14} className="text-green-500" />
                      <Text className="text-green-500 text-xs font-medium">Verified</Text>
                    </View>
                  )}
                  {details.rating != null && (
                    <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10">
                      <Icon as={Star} size={16} className="text-yellow-500 fill-yellow-500" />
                      <Text className="text-yellow-500 font-semibold">{details.rating.toFixed(1)}</Text>
                    </View>
                  )}
                </View>
              </View>
              {details.description && (
                <Text className="text-muted-foreground mt-2">{details.description}</Text>
              )}
            </View>
          </Card>

          {/* Contact & Location Information */}
          {(details.location || details.contact || (details as any).expand?.author) && (
            <Card className="p-4">
              <Text className="text-lg font-semibold mb-4">Contact & Location</Text>
              <View className="gap-4">
                {details.location ? (
                  <View className="flex-row items-center gap-3">
                    <Icon as={MapPin} size={20} className="text-muted-foreground" />
                    <View className="flex-1">
                      <Text className="text-sm text-muted-foreground">Location</Text>
                      <Text className="text-base font-medium">{details.location}</Text>
                    </View>
                  </View>
                ) : null}

                {details.contact ? (
                  <View className="flex-row items-center gap-3">
                    <Icon as={Phone} size={20} className="text-muted-foreground" />
                    <View className="flex-1">
                      <Text className="text-sm text-muted-foreground">Contact</Text>
                      <Text className="text-base font-medium">{details.contact}</Text>
                    </View>
                  </View>
                ) : null}

                {(details as any).expand?.author ? (
                  <View className="flex-row items-center gap-3">
                    <Icon as={User} size={20} className="text-muted-foreground" />
                    <View className="flex-1">
                      <Text className="text-sm text-muted-foreground">Author</Text>
                      <Text className="text-base font-medium">
                        {(details as any).expand.author.name || (details as any).expand.author.email || (details as any).expand.author.id}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </Card>
          )}

          {/* Services */}
          {details.service && details.service.length > 0 ? (
            <Card className="p-4">
              <Text className="text-lg font-semibold mb-4">Services Offered</Text>
              <View className="flex-row flex-wrap gap-2">
                {details.service.map((serviceId: string, index: number) => (
                  <Badge key={serviceId || index} variant="secondary" className="px-3 py-1">
                    <Text>
                      {(details as any).expand?.service && Array.isArray((details as any).expand.service)
                        ? (details as any).expand.service.find((s: any) => s.id === serviceId)?.title || serviceId
                        : serviceId}
                    </Text>
                  </Badge>
                ))}
              </View>
            </Card>
          ) : null}

          {/* Features */}
          {details.features && Array.isArray(details.features) && details.features.length > 0 && (
            <Card className="p-4">
              <Text className="text-lg font-semibold mb-4">Features</Text>
              <View className="flex-row flex-wrap gap-2">
                {details.features.map((feature: string, index: number) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    <Text>{feature}</Text>
                  </Badge>
                ))}
              </View>
            </Card>
          )}

          {/* Tags */}
          {details.tags && Array.isArray(details.tags) && details.tags.length > 0 && (
            <Card className="p-4">
              <Text className="text-lg font-semibold mb-4">Tags</Text>
              <View className="flex-row flex-wrap gap-2">
                {details.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    <Text>{tag}</Text>
                  </Badge>
                ))}
              </View>
            </Card>
          )}

          {/* Pricing & Rates */}
          {(
            details.tariffRates !== undefined ||
            details.freeDays !== undefined ||
            details.monthlyDues !== undefined ||
            details.DocumentationCharges !== undefined ||
            details.InsuranceCharges !== undefined
          ) && (
              <Card className="p-4">
                <Text className="text-lg font-semibold mb-4">Pricing & Rates</Text>
                <View className="gap-4">
                  {details.tariffRates !== undefined && (
                    <View className="flex-row items-center gap-3">
                      <Icon as={DollarSign} size={20} className="text-muted-foreground" />
                      <View className="flex-1">
                        <Text className="text-sm text-muted-foreground">Tariff Rates</Text>
                        <Text className="text-base font-medium">₹{details.tariffRates.toLocaleString()}</Text>
                      </View>
                    </View>
                  )}

                  {details.freeDays !== undefined && (
                    <View className="flex-row items-center gap-3">
                      <Icon as={Clock} size={20} className="text-muted-foreground" />
                      <View className="flex-1">
                        <Text className="text-sm text-muted-foreground">Free Days</Text>
                        <Text className="text-base font-medium">{details.freeDays} days</Text>
                      </View>
                    </View>
                  )}

                  {details.monthlyDues !== undefined && (
                    <View className="flex-row items-center gap-3">
                      <Icon as={DollarSign} size={20} className="text-muted-foreground" />
                      <View className="flex-1">
                        <Text className="text-sm text-muted-foreground">Monthly Dues</Text>
                        <Text className="text-base font-medium">₹{details.monthlyDues.toLocaleString()}</Text>
                      </View>
                    </View>
                  )}

                  {details.DocumentationCharges !== undefined && (
                    <View className="flex-row items-center gap-3">
                      <Icon as={FileText} size={20} className="text-muted-foreground" />
                      <View className="flex-1">
                        <Text className="text-sm text-muted-foreground">Documentation Charges</Text>
                        <Text className="text-base font-medium">₹{details.DocumentationCharges.toLocaleString()}</Text>
                      </View>
                    </View>
                  )}

                  {details.InsuranceCharges !== undefined && (
                    <View className="flex-row items-center gap-3">
                      <Icon as={FileText} size={20} className="text-muted-foreground" />
                      <View className="flex-1">
                        <Text className="text-sm text-muted-foreground">Insurance Charges</Text>
                        <Text className="text-base font-medium">₹{details.InsuranceCharges.toLocaleString()}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </Card>
            )}

          {/* Vehicle Information */}
          {(
            details.NoOfVehicles !== undefined ||
            (Array.isArray(details.TypesOfVehicles) ? details.TypesOfVehicles.length > 0 : !!details.TypesOfVehicles)
          ) && (
              <Card className="p-4">
                <Text className="text-lg font-semibold mb-4">Vehicle Information</Text>
                <View className="gap-4">
                  {details.NoOfVehicles !== undefined && (
                    <View className="flex-row items-center gap-3">
                      <Icon as={Car} size={20} className="text-muted-foreground" />
                      <View className="flex-1">
                        <Text className="text-sm text-muted-foreground">Number of Vehicles</Text>
                        <Text className="text-base font-medium">{details.NoOfVehicles}</Text>
                      </View>
                    </View>
                  )}

                  {details.TypesOfVehicles ? (
                    <View className="flex-1">
                      <Text className="text-sm text-muted-foreground mb-2">Types of Vehicles</Text>
                      {Array.isArray(details.TypesOfVehicles) ? (
                        <View className="flex-row flex-wrap gap-2">
                          {details.TypesOfVehicles.map((type: string, index: number) => {
                            return (
                              <Badge key={index} variant="secondary" className="px-3 py-1">
                                <Text>{String(type)}</Text>
                              </Badge>
                            );
                          })}
                        </View>
                      ) : (
                        <Text className="text-base font-medium">{JSON.stringify(details.TypesOfVehicles)}</Text>
                      )}
                    </View>
                  ) : null}
                </View>
              </Card>
            )}

          {/* Additional Information */}
          <Card className="p-4">
            <Text className="text-lg font-semibold mb-4">Additional Information</Text>
            <View className="gap-4">
              {details.bonded !== undefined && (
                <View className="flex-row items-center gap-3">
                  <Icon as={CheckCircle2} size={20} className="text-muted-foreground" />
                  <View className="flex-1">
                    <Text className="text-sm text-muted-foreground">Bonded</Text>
                    <Text className="text-base font-medium">{details.bonded ? "Yes" : "No"}</Text>
                  </View>
                </View>
              )}

              {details.general !== undefined && (
                <View className="flex-row items-center gap-3">
                  <Icon as={Building2} size={20} className="text-muted-foreground" />
                  <View className="flex-1">
                    <Text className="text-sm text-muted-foreground">General</Text>
                    <Text className="text-base font-medium">{details.general ? "Yes" : "No"}</Text>
                  </View>
                </View>
              )}
            </View>
          </Card>


          {/* System Information */}
          {(details.created || details.updated) && (
            <Card className="p-4">
              <Text className="text-lg font-semibold mb-4">System Information</Text>
              <View className="gap-4">
                {details.created && (
                  <View className="flex-row items-center gap-3">
                    <Icon as={Calendar} size={20} className="text-muted-foreground" />
                    <View className="flex-1">
                      <Text className="text-sm text-muted-foreground">Created At</Text>
                      <Text className="text-base font-medium">
                        {new Date(details.created).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}

                {details.updated && (
                  <View className="flex-row items-center gap-3">
                    <Icon as={Calendar} size={20} className="text-muted-foreground" />
                    <View className="flex-1">
                      <Text className="text-sm text-muted-foreground">Last Updated</Text>
                      <Text className="text-base font-medium">
                        {new Date(details.updated).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Card>
          )}

          {/* Action Buttons */}
          <View className="gap-2">
            <Button className="w-full">
              <Text>Edit Details</Text>
            </Button>
            <Button variant="outline" className="w-full">
              <Text>Download</Text>
            </Button>
          </View>
        </Fragment>
      </View>
    </ScrollView>
  );
}


