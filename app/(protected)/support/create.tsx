import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingView from "@/components/LoadingView";
import {
  createTicket,
  type TicketRecord,
  type TicketPriority,
} from "@/lib/actions/support";
import { listCfsOrdersForCurrentUser } from "@/lib/actions/cfs/fetch";
import type { CfsOrderRecord } from "@/lib/actions/cfs/fetch";

const PRIORITIES: TicketPriority[] = ["Low", "Medium", "High", "Urgent"];

export default function CreateTicketPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const prefillOrderId = params.orderId?.trim();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cfsOrders, setCfsOrders] = useState<CfsOrderRecord[]>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [relatedOrderId, setRelatedOrderId] = useState<string | null>(
    prefillOrderId || null
  );

  const loadCfsOrders = useCallback(async () => {
    const res = await listCfsOrdersForCurrentUser({ sort: "-created" });
    if (res.success && res.output) {
      setCfsOrders(res.output);
      if (prefillOrderId && res.output.some((o) => o.id === prefillOrderId)) {
        setRelatedOrderId(prefillOrderId);
      }
    }
  }, [prefillOrderId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await loadCfsOrders();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [loadCfsOrders]);

  const handleSubmit = useCallback(async () => {
    const trimmedSubject = subject.trim();
    if (!trimmedSubject) {
      Alert.alert("Required", "Please enter a subject.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createTicket({
        subject: trimmedSubject,
        description: description.trim() || undefined,
        priority,
        relatedOrderid: relatedOrderId ?? undefined,
      });
      if (res.success && res.output) {
        router.replace(`/(protected)/support/${res.output.id}` as any);
      } else {
        Alert.alert("Error", res.message ?? "Failed to create ticket.");
      }
    } finally {
      setSubmitting(false);
    }
  }, [subject, description, priority, relatedOrderId, router]);

  if (loading) {
    return <LoadingView LoadingText="Loading..." />;
  }

  return (
    <>
      <Stack.Screen options={{ title: "New Ticket" }} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="p-4 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Ticket details</CardTitle>
            <Text className="text-sm text-muted-foreground">
              Create a support ticket. You can optionally link it to a CFS order (schema: relatedOrderid).
            </Text>
          </CardHeader>
          <CardContent className="gap-4">
            <View>
              <Label nativeID="subject">Subject *</Label>
              <Input
                aria-labelledby="subject"
                placeholder="Brief summary of your issue"
                value={subject}
                onChangeText={setSubject}
                className="mt-1.5"
              />
            </View>
            <View>
              <Label nativeID="description">Description</Label>
              <Textarea
                aria-labelledby="description"
                placeholder="Describe your issue or request in detail..."
                value={description}
                onChangeText={setDescription}
                className="mt-1.5 min-h-[100px]"
              />
            </View>
            <View>
              <Label nativeID="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TicketPriority)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p} label={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>
            <View>
              <Label nativeID="relatedOrder">Related CFS order (optional)</Label>
              <Text className="text-xs text-muted-foreground mb-1.5">
                Schema v1.2.4: ticket.relatedOrderid links to cfs_orders only.
              </Text>
              <Select
                value={relatedOrderId ?? "__none__"}
                onValueChange={(v) =>
                  setRelatedOrderId(v === "__none__" ? null : v)
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" label="None">None</SelectItem>
                  {cfsOrders.map((order) => {
                    const label = `${order.id}${order.blNo ? ` · ${order.blNo}` : ""}${order.igmNo ? ` · ${order.igmNo}` : ""}`;
                    return (
                      <SelectItem key={order.id} value={order.id} label={label}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </View>
          </CardContent>
        </Card>
        <Button
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text>{submitting ? "Creating…" : "Create ticket"}</Text>
        </Button>
      </ScrollView>
    </>
  );
}
