import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { mergeFilters, type PbQueryOptions } from "@/lib/actions/pbOptions";
import { createNotificationForCurrentUser } from "@/lib/actions/notifications/notification";

export type WarehouseServiceRequestStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";

export type WarehouseServiceRequestRecord = {
  id: string;
  user?: string;
  order?: string;
  serviceType?: string;
  status?: WarehouseServiceRequestStatus;
  customerRemarks?: string;
  reason?: string;
  created?: string;
  updated?: string;
  expand?: any;
};

export type WarehouseServiceRequestDocument = {
  field: string;
  name: string;
  url: string;
};

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

async function resolveWarehouseSubServiceId(serviceTypeTitle: string): Promise<string | null> {
  const warehouseServiceId = await resolveServiceIdByTitle("Warehouse");
  if (!warehouseServiceId) return null;
  return resolveSubServiceIdByTitle({ serviceId: warehouseServiceId, subServiceTitle: serviceTypeTitle });
}

export async function listWarehouseRequestsByServiceTypeTitle(params: {
  serviceTypeTitle: string;
  options?: PbQueryOptions;
}): Promise<{ success: boolean; message: string; output: WarehouseServiceRequestRecord[] }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }
    const serviceTypeId = await resolveWarehouseSubServiceId(params.serviceTypeTitle);
    if (!serviceTypeId) {
      return { success: false, message: `${params.serviceTypeTitle} service type not found.`, output: [] };
    }
    const baseFilter = `user="${user.user.id}" && serviceType="${serviceTypeId}"`;
    const records = await pb.collection("warehouse_service_requests").getFullList<WarehouseServiceRequestRecord>({
      ...params.options,
      filter: mergeFilters(baseFilter, params.options?.filter),
      sort: params.options?.sort || "-created",
      expand: params.options?.expand || "order,serviceType",
    });
    return { success: true, message: "Fetched requests.", output: records };
  } catch (err: any) {
    console.error("Error listing warehouse service requests", err);
    const details = err?.data?.message || err?.message;
    return { success: false, message: details || "Failed to fetch requests.", output: [] };
  }
}

export async function getWarehouseRequestById(params: {
  requestId: string;
  options?: PbQueryOptions;
}): Promise<{
  success: boolean;
  message: string;
  output: { request: WarehouseServiceRequestRecord; documents: WarehouseServiceRequestDocument[]; authHeader: string } | null;
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
    const req = await pb.collection("warehouse_service_requests").getOne<WarehouseServiceRequestRecord>(id, {
      ...params.options,
      expand: params.options?.expand || "order,serviceType",
    });
    if (req.user && req.user !== user.user.id) {
      return { success: false, message: "Not allowed to view this request.", output: null };
    }
    const documents: WarehouseServiceRequestDocument[] = [];
    const authHeader = pb.authStore?.token ? `Bearer ${pb.authStore.token}` : "";
    return { success: true, message: "Fetched request.", output: { request: req, documents, authHeader } };
  } catch (err: any) {
    console.error("Error fetching warehouse service request", err);
    const details = err?.data?.message || err?.message;
    return { success: false, message: details || "Failed to fetch request.", output: null };
  }
}

export type PickedFile = { uri: string; name: string; type: string };

export async function createWarehouseRequestByServiceTypeTitle(params: {
  serviceTypeTitle: string;
  orderId: string;
  customerRemarks?: string;
  files?: PickedFile[] | null;
}): Promise<{ success: boolean; message: string; output: WarehouseServiceRequestRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated. Please login again.", output: null };
    }
    const orderId = params.orderId?.trim();
    if (!orderId) {
      return { success: false, message: "Order is required.", output: null };
    }
    const serviceTypeId = await resolveWarehouseSubServiceId(params.serviceTypeTitle);
    if (!serviceTypeId) {
      return { success: false, message: `${params.serviceTypeTitle} service type not found.`, output: null };
    }
    const data: Record<string, unknown> = {
      user: user.user.id,
      order: orderId,
      serviceType: serviceTypeId,
      status: "Pending",
      customerRemarks: (params.customerRemarks || "").trim() || undefined,
    };
    const created = await pb.collection("warehouse_service_requests").create<WarehouseServiceRequestRecord>(data as any);
    try {
      await createNotificationForCurrentUser({
        title: `${params.serviceTypeTitle} Request Created`,
        description: `Your ${params.serviceTypeTitle} request has been created successfully.`,
        type: "event",
        ordersId: orderId,
      });
    } catch (err) {
      console.error("Error creating notification for warehouse service request", err);
    }
    return { success: true, message: "Request created successfully.", output: created };
  } catch (err: any) {
    console.error("Error creating warehouse service request", err);
    const details = err?.data?.message || err?.message;
    return { success: false, message: details || "Failed to create request.", output: null };
  }
}

export async function updateWarehouseRequestById(params: {
  requestId: string;
  customerRemarks?: string;
}): Promise<{ success: boolean; message: string; output: WarehouseServiceRequestRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const id = params.requestId?.trim();
    if (!id) {
      return { success: false, message: "Request ID is required.", output: null };
    }
    const existing = await pb.collection("warehouse_service_requests").getOne<WarehouseServiceRequestRecord>(id);
    if (existing.user && existing.user !== user.user.id) {
      return { success: false, message: "Not allowed to update this request.", output: null };
    }
    const updateData: Record<string, unknown> = {};
    if (params.customerRemarks !== undefined) updateData.customerRemarks = params.customerRemarks?.trim() || undefined;
    const updated = await pb.collection("warehouse_service_requests").update<WarehouseServiceRequestRecord>(id, updateData as any);
    try {
      await createNotificationForCurrentUser({
        title: "Service Request Updated",
        description: "Your warehouse service request has been updated.",
        type: "event",
        ordersId: existing.order,
      });
    } catch (err) {
      console.error("Error creating notification for warehouse service request update", err);
    }
    return { success: true, message: "Request updated successfully.", output: updated };
  } catch (err: any) {
    console.error("Error updating warehouse service request", err);
    const details = err?.data?.message || err?.message;
    return { success: false, message: details || "Failed to update request.", output: null };
  }
}
