import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { createNotificationForCurrentUser } from "@/lib/actions/notifications/notification";

export type TransportOrderStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "In Transit" | "Delivered";

export type TransportOrderRecord = {
  id: string;
  consigneeName?: string;
  chaName?: string;
  provider?: string;
  customer?: string;
  startDate?: string;
  startLocation?: string;
  endDate?: string;
  endLocation?: string;
  specialRequest?: string;
  vehicleDescription?: string;
  orderDescription?: string;
  createdBy?: string;
  reason?: string;
  status?: TransportOrderStatus;
  files?: string[];
  merchantVerified?: boolean;
  merchantVerifiedBy?: string;
  golVerified?: boolean;
  golVerifiedBy?: string;
  created?: string;
  updated?: string;
  expand?: any;
};

export type TransportOrderCreateParams = {
  consigneeName?: string;
  chaName?: string;
  provider?: string;
  startDate?: Date;
  startLocation?: string;
  endDate?: Date;
  endLocation?: string;
  specialRequest?: string;
  vehicleDescription?: string;
  orderDescription?: string;
  files?: Array<{ uri: string; name: string; type: string }> | null;
};

function toIsoStringOrUndefined(d?: Date) {
  if (!d) return undefined;
  return d.toISOString();
}

export async function createTransportOrder(params: TransportOrderCreateParams): Promise<{
  success: boolean;
  message: string;
  output: TransportOrderRecord | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated. Please login again.", output: null };
    }

    const data: Record<string, unknown> = {
      consigneeName: (params.consigneeName || "").trim() || undefined,
      chaName: (params.chaName || "").trim() || undefined,
      provider: params.provider?.trim() || undefined,
      customer: user.user.id,
      createdBy: user.user.id,
      status: "Pending",
      startDate: toIsoStringOrUndefined(params.startDate),
      endDate: toIsoStringOrUndefined(params.endDate),
      startLocation: (params.startLocation || "").trim() || undefined,
      endLocation: (params.endLocation || "").trim() || undefined,
      specialRequest: (params.specialRequest || "").trim() || undefined,
      vehicleDescription: (params.vehicleDescription || "").trim() || undefined,
      orderDescription: (params.orderDescription || "").trim() || undefined,
    };
    const created = await pb.collection("transport_orders").create<TransportOrderRecord>(data as any);

    try {
      await createNotificationForCurrentUser({
        title: "Transport Order Created",
        description: "Your transport order has been created successfully.",
        type: "event",
        ordersId: (created as any)?.id,
      });
    } catch (err) {
      console.error("Error creating notification for transport order", err);
    }

    return { success: true, message: "Transport order created successfully.", output: created };
  } catch (err: any) {
    console.error("Error creating transport order", err);
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status
      ? `Failed to create transport order (HTTP ${status}). ${details || ""}`.trim()
      : details || "Failed to create transport order.";
    return { success: false, message, output: null };
  }
}

