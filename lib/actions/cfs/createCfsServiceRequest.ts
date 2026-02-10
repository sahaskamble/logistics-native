import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { createNotificationForCurrentUser } from "@/lib/actions/notifications/notification";

type PbBaseRecord = {
  id: string;
  created?: string;
  updated?: string;
};

type ServiceRecord = PbBaseRecord & {
  title?: string;
};

type SubServiceRecord = PbBaseRecord & {
  title?: string;
  service?: string;
};

type CfsServiceRequestRecord = PbBaseRecord & {
  user?: string;
  order?: string;
  serviceType?: string;
  customerRemarks?: string;
  status?: "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";
};

export async function createCfsServiceRequest(params: {
  orderId: string;
  serviceTitle: string;
  serviceTypeTitle: string;
  customerRemarks?: string;
}): Promise<{ success: boolean; message: string; output: CfsServiceRequestRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return {
        success: false,
        message: "User not authenticated. Please login again.",
        output: null,
      };
    }

    const orderId = params.orderId?.trim();
    if (!orderId) {
      return { success: false, message: "Order is required.", output: null };
    }

    const serviceTitle = params.serviceTitle?.trim();
    if (!serviceTitle) {
      return { success: false, message: "Service title is required.", output: null };
    }

    const serviceTypeTitle = params.serviceTypeTitle?.trim();
    if (!serviceTypeTitle) {
      return { success: false, message: "Service type is required.", output: null };
    }

    let service: ServiceRecord;
    try {
      service = await pb
        .collection("services")
        .getFirstListItem<ServiceRecord>(`title="${serviceTitle.replace(/\"/g, "\\\"")}"`);
    } catch (err: any) {
      if (err?.status === 404) {
        return {
          success: false,
          message: `Service not found: ${serviceTitle}`,
          output: null,
        };
      }
      throw err;
    }

    let serviceType: SubServiceRecord;
    try {
      serviceType = await pb
        .collection("sub_services")
        .getFirstListItem<SubServiceRecord>(
          `service="${service.id}" && title="${serviceTypeTitle.replace(/\"/g, "\\\"")}"`
        );
    } catch (err: any) {
      if (err?.status === 404) {
        return {
          success: false,
          message: `CFS service type not found: ${serviceTypeTitle}`,
          output: null,
        };
      }
      throw err;
    }

    const created = await pb.collection("cfs_service_requests").create<CfsServiceRequestRecord>({
      user: user.user.id,
      order: orderId,
      serviceType: serviceType.id,
      customerRemarks: params.customerRemarks?.trim() || undefined,
      status: "Pending",
    });

    try {
      await createNotificationForCurrentUser({
        title: "Service Request Created",
        description: `Your ${params.serviceTypeTitle} request has been created successfully.`,
        type: "event",
        ordersId: orderId,
      });
    } catch (err) {
      console.error("Error creating notification for CFS service request", err);
    }

    return { success: true, message: "CFS service request created successfully.", output: created };
  } catch (err: any) {
    console.error("Error creating CFS service request", err);
    return {
      success: false,
      message: err?.message || "Failed to create CFS service request.",
      output: null,
    };
  }
}
