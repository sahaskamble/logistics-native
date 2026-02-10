import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { createNotificationForCurrentUser } from "@/lib/actions/notifications/notification";

export type TransportServiceRequestStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";

export type TransportServiceRequestRecord = {
  id: string;
  order?: string; // relation to transport_orders
  user?: string; // relation to users
  serviceType?: string; // relation to sub_services
  merchantVerified?: boolean;
  merchantVerifiedBy?: string;
  golVerified?: boolean;
  golVerifiedBy?: string;
  customerRemarks?: string;
  reason?: string;
  status?: TransportServiceRequestStatus;
  created?: string;
  updated?: string;
  expand?: any;
};

export type TransportServiceRequestCreateParams = {
  order: string;
  serviceType: string;
  customerRemarks?: string;
};

export type TransportServiceRequestUpdateParams = {
  customerRemarks?: string;
};

export async function createTransportServiceRequest(
  params: TransportServiceRequestCreateParams
): Promise<{ success: boolean; message: string; output: TransportServiceRequestRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated. Please login again.", output: null };
    }
    const orderId = params.order?.trim();
    const serviceTypeId = params.serviceType?.trim();
    if (!orderId || !serviceTypeId) {
      return { success: false, message: "Order and service type are required.", output: null };
    }
    const data: Record<string, unknown> = {
      order: orderId,
      user: user.user.id,
      serviceType: serviceTypeId,
      status: "Pending",
      customerRemarks: (params.customerRemarks || "").trim() || undefined,
    };
    const created = await pb.collection("transport_service_requests").create<TransportServiceRequestRecord>(data as any);
    try {
      await createNotificationForCurrentUser({
        title: "Transport Service Request Created",
        description: "Your transport service request has been created successfully.",
        type: "event",
        ordersId: orderId,
      });
    } catch (err) {
      console.error("Error creating notification for transport service request", err);
    }
    return { success: true, message: "Transport service request created successfully.", output: created };
  } catch (err: any) {
    console.error("Error creating transport service request", err);
    const details = err?.data?.message || err?.message;
    return { success: false, message: details || "Failed to create transport service request.", output: null };
  }
}

export async function listTransportServiceRequestsForCurrentUser(options?: {
  filter?: string;
  expand?: string;
  sort?: string;
}): Promise<{ success: boolean; message: string; output: TransportServiceRequestRecord[] }> {
  return { success: false, message: "Not implemented", output: [] };
}

export async function getTransportServiceRequestById(requestId: string, options?: {
  expand?: string;
}): Promise<{ success: boolean; message: string; output: TransportServiceRequestRecord | null }> {
  return { success: false, message: "Not implemented", output: null };
}

export async function updateTransportServiceRequestById(
  requestId: string,
  data: TransportServiceRequestUpdateParams
): Promise<{ success: boolean; message: string; output: TransportServiceRequestRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const id = requestId?.trim();
    if (!id) {
      return { success: false, message: "Request ID is required.", output: null };
    }
    const existing = await pb.collection("transport_service_requests").getOne<TransportServiceRequestRecord>(id);
    if (existing.user && existing.user !== user.user.id) {
      return { success: false, message: "Not allowed to update this request.", output: null };
    }
    const updateData: Record<string, unknown> = {};
    if (data.customerRemarks !== undefined) updateData.customerRemarks = data.customerRemarks?.trim() || undefined;
    const updated = await pb.collection("transport_service_requests").update<TransportServiceRequestRecord>(id, updateData as any);
    try {
      await createNotificationForCurrentUser({
        title: "Transport Service Request Updated",
        description: "Your transport service request has been updated.",
        type: "event",
        ordersId: existing.order,
      });
    } catch (err) {
      console.error("Error creating notification for transport service request update", err);
    }
    return { success: true, message: "Transport service request updated successfully.", output: updated };
  } catch (err: any) {
    console.error("Error updating transport service request", err);
    const details = err?.data?.message || err?.message;
    return { success: false, message: details || "Failed to update transport service request.", output: null };
  }
}

export async function deleteTransportServiceRequestById(requestId: string): Promise<{ success: boolean; message: string }> {
  return { success: false, message: "Not implemented" };
}

