import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import LoadingView from "@/components/LoadingView";
import { createCfsServiceRequest } from "@/lib/actions/cfs/createCfsServiceRequest";
import {
  listCfsOrdersForCurrentUser,
  listCfsServiceRequestsByOrder,
  listCfsSubServices,
} from "@/lib/actions/cfs/fetch";

type CfsOrder = {
  id: string;
  orderDescription?: string;
  blNo?: string;
  igmNo?: string;
};

type SubService = {
  id: string;
  title?: string;
};

type CfsServiceRequest = {
  id: string;
  created?: string;
  status?: string;
  customerRemarks?: string;
  expand?: any;
};

type DefinedOption = Option & { value: string; label: string };

function isDefinedOption(opt?: Option): opt is DefinedOption {
  return !!opt && typeof opt.value === "string" && !!opt.value && typeof opt.label === "string" && !!opt.label;
}

function getOrderLabel(order: CfsOrder) {
  return order.orderDescription || order.blNo || order.igmNo || `Order #${order.id.slice(0, 8)}`;
}

function getStatusStyle(status?: string) {
  switch (status) {
    case "Pending":
      return "text-yellow-600";
    case "Accepted":
      return "text-blue-600";
    case "Rejected":
      return "text-red-600";
    case "In Progress":
      return "text-blue-600";
    case "Completed":
      return "text-green-600";
    default:
      return "text-muted-foreground";
  }
}

export default function CfsServiceRequestForm(props: {
  serviceTitle: string;
  presetServiceTypeTitle?: string;
  submitLabel: string;
}) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [orders, setOrders] = useState<CfsOrder[]>([]);
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [requests, setRequests] = useState<CfsServiceRequest[]>([]);

  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedServiceTypeTitle, setSelectedServiceTypeTitle] = useState<string>(props.presetServiceTypeTitle || "");
  const [customerRemarks, setCustomerRemarks] = useState<string>("");

  const orderOptions: Option[] = useMemo(() => {
    return orders.map((o) => ({ value: o.id, label: getOrderLabel(o) }));
  }, [orders]);

  const serviceTypeOptions: Option[] = useMemo(() => {
    return subServices
      .filter((s) => !!s.title)
      .map((s) => ({ value: s.title as string, label: s.title as string }));
  }, [subServices]);

  const selectedOrderOption = useMemo(() => {
    return orderOptions.find((o) => (o?.value || "") === selectedOrderId);
  }, [orderOptions, selectedOrderId]);

  const selectedServiceTypeOption = useMemo(() => {
    return serviceTypeOptions.find((o) => (o?.value || "") === selectedServiceTypeTitle);
  }, [serviceTypeOptions, selectedServiceTypeTitle]);

  async function refreshRequests(orderId: string) {
    const res = await listCfsServiceRequestsByOrder(orderId);
    if (!res.success) {
      Alert.alert("Error", res.message);
      setRequests([]);
      return;
    }
    setRequests(res.output);
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [ordersRes, subServicesRes] = await Promise.all([
        listCfsOrdersForCurrentUser(),
        listCfsSubServices(props.serviceTitle),
      ]);

      if (!ordersRes.success) {
        Alert.alert("Error", ordersRes.message);
      }
      if (!subServicesRes.success) {
        Alert.alert("Error", subServicesRes.message);
      }

      setOrders(ordersRes.output);
      setSubServices(subServicesRes.output);

      const initialOrderId = ordersRes.output[0]?.id || "";
      setSelectedOrderId((prev) => prev || initialOrderId);

      if (!props.presetServiceTypeTitle) {
        const firstType = subServicesRes.output.find((s) => !!s.title)?.title || "";
        setSelectedServiceTypeTitle((prev) => prev || (firstType as string));
      }

      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.serviceTitle, props.presetServiceTypeTitle]);

  useEffect(() => {
    if (!selectedOrderId) return;
    refreshRequests(selectedOrderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrderId]);

  async function handleSubmit() {
    try {
      if (!selectedOrderId) {
        Alert.alert("Error", "Please select an order.");
        return;
      }

      if (!selectedServiceTypeTitle) {
        Alert.alert("Error", "Please select a service type.");
        return;
      }

      setSubmitting(true);

      const res = await createCfsServiceRequest({
        orderId: selectedOrderId,
        serviceTitle: props.serviceTitle,
        serviceTypeTitle: selectedServiceTypeTitle,
        customerRemarks,
      });

      if (!res.success) {
        Alert.alert("Error", res.message);
        return;
      }

      setCustomerRemarks("");
      Alert.alert("Success", "Request submitted successfully.");
      await refreshRequests(selectedOrderId);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingView LoadingText="Loading CFS service request..." />;
  }

  return (
    <View className="p-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>New Request</CardTitle>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="gap-2">
            <Label>Order *</Label>
            <Select
              value={selectedOrderOption}
              onValueChange={(opt?: Option) => {
                if (!opt) return;
                setSelectedOrderId(opt.value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an order" />
              </SelectTrigger>
              <SelectContent>
                {orderOptions
                  .filter(isDefinedOption)
                  .map((o) => (
                    <SelectItem key={o.value} value={o.value} label={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </View>

          <View className="gap-2">
            <Label>Service Type *</Label>
            <Select
              value={selectedServiceTypeOption}
              onValueChange={(opt?: Option) => {
                if (!opt) return;
                setSelectedServiceTypeTitle(opt.value);
              }}
              disabled={!!props.presetServiceTypeTitle}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypeOptions
                  .filter(isDefinedOption)
                  .map((o) => (
                    <SelectItem key={o.value} value={o.value} label={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </View>

          <View className="gap-2">
            <Label>Customer Remarks</Label>
            <Input
              value={customerRemarks}
              onChangeText={setCustomerRemarks}
              placeholder="Add remarks (optional)"
              multiline
              numberOfLines={3}
              className="min-h-[80px]"
            />
          </View>

          <Button className="w-full" onPress={handleSubmit} disabled={submitting}>
            {submitting ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="white" />
                <Text>Submitting...</Text>
              </View>
            ) : (
              <Text>{props.submitLabel}</Text>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requests for Selected Order</CardTitle>
        </CardHeader>
        <CardContent className="gap-3">
          {!selectedOrderId ? (
            <Text className="text-muted-foreground">Select an order to view requests.</Text>
          ) : requests.length === 0 ? (
            <Text className="text-muted-foreground">No requests found for this order.</Text>
          ) : (
            requests.map((r) => {
              const serviceTypeTitle = (r as any).expand?.serviceType?.title || "Service";
              return (
                <View key={r.id} className="border border-border rounded-lg p-3 gap-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold">{serviceTypeTitle}</Text>
                    <Text className={getStatusStyle(r.status)}>{r.status || "Unknown"}</Text>
                  </View>
                  {!!r.customerRemarks && (
                    <Text className="text-sm text-muted-foreground">{r.customerRemarks}</Text>
                  )}
                  <Text className="text-xs text-muted-foreground">
                    {r.created
                      ? new Date(r.created).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </Text>
                </View>
              );
            })
          )}
        </CardContent>
      </Card>
    </View>
  );
}
