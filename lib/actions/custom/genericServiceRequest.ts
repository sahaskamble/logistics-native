import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { createNotificationForCurrentUser } from "@/lib/actions/notifications/notification";

export type CustomCfsServiceRequestRecord = {
  id: string;
  user?: string;
  order?: string;
  serviceType?: string;
  status?: string;
  customerRemarks?: string;
  created?: string;
  updated?: string;
  expand?: any;
};

export type CustomServiceRequestCreateParams = {
  orderId: string;
  serviceTypeId: string;
  customerRemarks?: string;
};

/** Create a custom CFS service request (custom_cfs_service_requests collection). */
export async function createCustomCfsServiceRequest(params: CustomServiceRequestCreateParams): Promise<{
  success: boolean;
  message: string;
  output: CustomCfsServiceRequestRecord | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated. Please login again.", output: null };
    }
    const orderId = params.orderId?.trim();
    const serviceTypeId = params.serviceTypeId?.trim();
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
    const created = await pb.collection("custom_cfs_service_requests").create<CustomCfsServiceRequestRecord>(data as any);
    try {
      await createNotificationForCurrentUser({
        title: "Custom Service Request Created",
        description: "Your custom service request has been created successfully.",
        type: "event",
        ordersId: orderId,
      });
    } catch (err) {
      console.error("Error creating notification for custom service request", err);
    }
    return { success: true, message: "Custom service request created successfully.", output: created };
  } catch (err: any) {
    console.error("Error creating custom service request", err);
    const details = err?.data?.message || err?.message;
    return { success: false, message: details || "Failed to create custom service request.", output: null };
  }
}
