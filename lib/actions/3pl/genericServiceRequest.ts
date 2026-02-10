import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { mergeFilters, type PbQueryOptions } from "@/lib/actions/pbOptions";
import { createNotificationForCurrentUser } from "@/lib/actions/notifications/notification";

export type ThreePlServiceRequestRecord = {
  id: string;
  user?: string;
  order?: string;
  service?: string;
  serviceType?: string;
  status?: string;
  customerRemarks?: string;
  reason?: string;
  created?: string;
  updated?: string;
  expand?: any;
};

export type PickedFile = { uri: string; name: string; type: string };

async function resolveServiceIdByTitle(serviceTitle: string): Promise<string | null> {
  try {
    const service = await pb
      .collection("services")
      .getFirstListItem<{ id: string }>(`title="${serviceTitle.replace(/"/g, '\\"')}"`);
    return service?.id || null;
  } catch {
    return null;
  }
}

async function resolveSubServiceIdByTitle(params: {
  serviceId: string;
  subServiceTitle: string;
}): Promise<string | null> {
  try {
    const rec = await pb.collection("sub_services").getFirstListItem<{ id: string }>(
      `service="${params.serviceId}" && title="${params.subServiceTitle.replace(/"/g, '\\"')}"`
    );
    return rec?.id || null;
  } catch {
    return null;
  }
}

async function resolve3plSubServiceId(serviceTypeTitle: string): Promise<{ serviceId: string; serviceTypeId: string } | null> {
  const serviceId = await resolveServiceIdByTitle("3PL");
  if (!serviceId) return null;
  const serviceTypeId = await resolveSubServiceIdByTitle({ serviceId, subServiceTitle: serviceTypeTitle });
  if (!serviceTypeId) return null;
  return { serviceId, serviceTypeId };
}

export async function list3plRequestsByServiceTypeTitle(params: {
  serviceTypeTitle: string;
  options?: PbQueryOptions;
}): Promise<{ success: boolean; message: string; output: ThreePlServiceRequestRecord[] }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }
    const resolved = await resolve3plSubServiceId(params.serviceTypeTitle);
    if (!resolved) {
      return { success: false, message: `${params.serviceTypeTitle} service type not found.`, output: [] };
    }
    const baseFilter = `user="${user.user.id}" && serviceType="${resolved.serviceTypeId}"`;
    const records = await pb.collection("3pl_service_requests").getFullList<ThreePlServiceRequestRecord>({
      ...params.options,
      filter: mergeFilters(baseFilter, params.options?.filter),
      sort: params.options?.sort || "-created",
      expand: params.options?.expand || "order,serviceType",
    });
    return { success: true, message: "Fetched requests.", output: records };
  } catch (err: any) {
    console.error("Error listing 3PL service requests", err);
    const details = err?.data?.message || err?.message;
    return { success: false, message: details || "Failed to fetch requests.", output: [] };
  }
}

export async function get3plRequestById(params: {
  requestId: string;
  options?: PbQueryOptions;
}): Promise<{
  success: boolean;
  message: string;
  output: ThreePlServiceRequestRecord | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const id = params.requestId?.trim();
    if (!id) {
      return { success: false, message: "Request ID is required.", output: null };
    }
    const req = await pb.collection("3pl_service_requests").getOne<ThreePlServiceRequestRecord>(id, {
      expand: params.options?.expand || "order,serviceType",
    });
    if (req.user && req.user !== user.user.id) {
      return { success: false, message: "Not allowed to view this request.", output: null };
    }
    return { success: true, message: "Fetched request.", output: req };
  } catch (err: any) {
    console.error("Error fetching 3PL service request", err);
    const details = err?.data?.message || err?.message;
    return { success: false, message: details || "Failed to fetch request.", output: null };
  }
}

export async function create3plRequestByServiceTypeTitle(params: {
  serviceTypeTitle: string;
  orderId: string;
  customerRemarks?: string;
  files?: PickedFile[] | null;
}): Promise<{ success: boolean; message: string; output: ThreePlServiceRequestRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated. Please login again.", output: null };
    }
    const orderId = params.orderId?.trim();
    if (!orderId) {
      return { success: false, message: "Order is required.", output: null };
    }
    const resolved = await resolve3plSubServiceId(params.serviceTypeTitle);
    if (!resolved) {
      return { success: false, message: `${params.serviceTypeTitle} service type not found.`, output: null };
    }
    const data: Record<string, unknown> = {
      user: user.user.id,
      order: orderId,
      service: resolved.serviceId,
      serviceType: resolved.serviceTypeId,
      status: "Pending",
      customerRemarks: (params.customerRemarks || "").trim() || undefined,
    };
    const created = await pb.collection("3pl_service_requests").create<ThreePlServiceRequestRecord>(data as any);
    try {
      await createNotificationForCurrentUser({
        title: `${params.serviceTypeTitle} Request Created`,
        description: `Your ${params.serviceTypeTitle} request has been created successfully.`,
        type: "event",
        ordersId: orderId,
      });
    } catch (err) {
      console.error("Error creating notification for 3PL service request", err);
    }
    return { success: true, message: "Request created successfully.", output: created };
  } catch (err: any) {
    console.error("Error creating 3PL service request", err);
    const details = err?.data?.message || err?.message;
    return { success: false, message: details || "Failed to create request.", output: null };
  }
}

export async function update3plRequestById(params: {
  requestId: string;
  customerRemarks?: string;
}): Promise<{ success: boolean; message: string; output: ThreePlServiceRequestRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const id = params.requestId?.trim();
    if (!id) {
      return { success: false, message: "Request ID is required.", output: null };
    }
    const existing = await pb.collection("3pl_service_requests").getOne<ThreePlServiceRequestRecord>(id);
    if (existing.user && existing.user !== user.user.id) {
      return { success: false, message: "Not allowed to update this request.", output: null };
    }
    const updateData: Record<string, unknown> = {};
    if (params.customerRemarks !== undefined) updateData.customerRemarks = params.customerRemarks?.trim() || undefined;
    const updated = await pb.collection("3pl_service_requests").update<ThreePlServiceRequestRecord>(id, updateData as any);
    try {
      await createNotificationForCurrentUser({
        title: "Service Request Updated",
        description: "Your 3PL service request has been updated.",
        type: "event",
        ordersId: existing.order,
      });
    } catch (err) {
      console.error("Error creating notification for 3PL service request update", err);
    }
    return { success: true, message: "Request updated successfully.", output: updated };
  } catch (err: any) {
    console.error("Error updating 3PL service request", err);
    const details = err?.data?.message || err?.message;
    return { success: false, message: details || "Failed to update request.", output: null };
  }
}
