import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { getEirCopyRequestById } from "@/lib/actions/cfs/eirCopy";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft } from "lucide-react-native";

function getStatusVariant(status?: string) {
  switch (status) {
    case "Pending":
      return "default" as const;
    case "Accepted":
    case "In Progress":
      return "secondary" as const;
    case "Rejected":
      return "destructive" as const;
    case "Completed":
      return "outline" as const;
    default:
      return "outline" as const;
  }
}

function isImageFile(filename?: string) {
  if (!filename) return false;
  const lower = filename.toLowerCase();
  return [".jpg", ".jpeg", ".png", ".gif", ".webp"].some((ext) => lower.endsWith(ext));
}

export default function EirCopyDetailPage() {
  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId: string }>();

  const [loading, setLoading] = useState(true);
  const [req, setReq] = useState<any>(null);
  const [documents, setDocuments] = useState<{ field: string; name: string; url: string }[]>([]);
  const [authHeader, setAuthHeader] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      if (!recordId) return;
      setLoading(true);
      const res = await getEirCopyRequestById(recordId, { expand: "order,serviceType" });
      if (!res.success || !res.output) {
        Alert.alert("Error", res.message || "Failed to load request");
        setReq(null);
        setDocuments([]);
        setAuthHeader("");
      } else {
        setReq(res.output.request);
        setDocuments(res.output.documents);
        setAuthHeader(res.output.authHeader);
      }
      setLoading(false);
    };
    load();
  }, [recordId]);

  const imageDocs = useMemo(() => documents.filter((d) => isImageFile(d.name)), [documents]);
  const otherDocs = useMemo(() => documents.filter((d) => !isImageFile(d.name)), [documents]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-muted-foreground">Loading request...</Text>
      </View>
    );
  }

  if (!req) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Request not found</Text>
      </View>
    );
  }

  const serviceTypeTitle = (req as any)?.expand?.serviceType?.title || "EIR Copy";
  const orderId = (req as any)?.expand?.order?.id || req.order || "";

  return (
    <>
      <Stack.Screen
        options={{
          title: `Request #${req.id}`,
          headerRight: () => (
            <Button variant="outline" onPress={() => router.push(`/(protected)/cfs/eir-copy/edit/${req.id}`)}>
              <Text>Edit</Text>
            </Button>
          ),
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
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <CardTitle>{serviceTypeTitle}</CardTitle>
                <Badge variant={getStatusVariant(req.status)}>
                  <Text>{req.status || "Unknown"}</Text>
                </Badge>
              </View>
            </CardHeader>
            <CardContent className="gap-3">
              <InfoRow label="Request ID" value={req.id} />
              <InfoRow label="Order" value={orderId} />
              <InfoRow label="Customer Remarks" value={req.customerRemarks || "-"} />
              {!!req.reason && <InfoRow label="Reason" value={req.reason} />}
            </CardContent>
          </Card>

          {(imageDocs.length > 0 || otherDocs.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Attachments ({documents.length})</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                {imageDocs.length > 0 && (
                  <View className="gap-2">
                    <Text className="font-medium">Images</Text>
                    {imageDocs.map((doc) => (
                      <View key={doc.url} className="rounded-lg overflow-hidden border border-border">
                        <Image
                          source={{ uri: doc.url, headers: authHeader ? { Authorization: authHeader } : undefined }}
                          style={{ width: "100%", height: 180 }}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </View>
                )}

                {otherDocs.length > 0 && (
                  <View className="gap-2">
                    <Text className="font-medium">Files</Text>
                    {otherDocs.map((doc) => (
                      <Pressable
                        key={doc.url}
                        className="py-3 px-4 bg-muted/50 rounded-lg"
                        onPress={() => Alert.alert("File", doc.name)}
                      >
                        <Text className="font-medium">{doc.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </CardContent>
            </Card>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <>
      <View className="gap-1">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        <Text className="text-base">{value || "-"}</Text>
      </View>
      <Separator className="my-2" />
    </>
  );
}
