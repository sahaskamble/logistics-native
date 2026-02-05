
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoadingView from "@/components/LoadingView";

import { getEirCopyRequestById, updateEirCopyRequest } from "@/lib/actions/cfs/eirCopy";

type PickedFile = { uri: string; name: string; type: string };

export default function EditEirCopyRequestPage() {
  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [req, setReq] = useState<any>(null);
  const [customerRemarks, setCustomerRemarks] = useState<string>("");
  const [addFiles, setAddFiles] = useState<PickedFile[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!recordId) return;
      setLoading(true);
      const res = await getEirCopyRequestById(recordId, { expand: "order,serviceType" });
      if (!res.success || !res.output) {
        Alert.alert("Error", res.message || "Failed to load request");
        setReq(null);
        setCustomerRemarks("");
      } else {
        setReq(res.output.request);
        setCustomerRemarks(res.output.request.customerRemarks || "");
      }
      setLoading(false);
    };
    load();
  }, [recordId]);

  const existingFilesCount = useMemo(() => {
    const files = (req as any)?.files;
    return Array.isArray(files) ? files.length : 0;
  }, [req]);

  const pickFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;
      const assets = res.assets || [];
      const mapped: PickedFile[] = assets
        .filter((a) => !!a?.uri)
        .map((a) => ({
          uri: a.uri,
          name: a.name || "file",
          type: (a.mimeType || "application/octet-stream") as string,
        }));
      setAddFiles(mapped);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to pick files.");
    }
  };

  const save = async () => {
    if (!recordId) return;

    setSaving(true);
    try {
      const res = await updateEirCopyRequest({
        requestId: recordId,
        customerRemarks,
        addFiles,
      });

      if (!res.success) {
        Alert.alert("Error", res.message);
        return;
      }

      Alert.alert("Success", res.message);
      router.replace(`/(protected)/cfs/eir-copy/view/${recordId}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingView LoadingText="Loading request..." />;
  }

  if (!req) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Request not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `Edit #${req.id}` }} />

      <ScrollView className="flex-1 bg-background">
        <View className="p-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit EIR Copy Request</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Customer Remarks</Text>
                <Input
                  value={customerRemarks}
                  onChangeText={setCustomerRemarks}
                  placeholder="Add remarks (optional)"
                  multiline
                  numberOfLines={4}
                  className="min-h-24"
                />
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Existing attachments</Text>
                <Text>{existingFilesCount > 0 ? `${existingFilesCount} file(s)` : "-"}</Text>
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">Add more attachments</Text>
                <Button variant="outline" onPress={pickFiles}>
                  <Text>{addFiles.length > 0 ? `${addFiles.length} file(s) selected` : "Pick files"}</Text>
                </Button>
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
