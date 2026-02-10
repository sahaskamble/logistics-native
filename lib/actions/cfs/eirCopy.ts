import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { mergeFilters, type PbQueryOptions } from "@/lib/actions/pbOptions";
import { createNotificationForCurrentUser } from "@/lib/actions/notifications/notification";

type PbBaseRecord = {
  id: string;
  created?: string;
  updated?: string;
  expand?: any;
};

export type CfsServiceRequestStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";

export type CfsServiceRequestRecord = PbBaseRecord & {
  user?: string;
  order?: string;
  serviceType?: string;
  customerRemarks?: string;
  reason?: string;
  status?: CfsServiceRequestStatus;
  files?: string[];
  merchantVerified?: boolean;
  merchantVerifiedBy?: string;
  Extra_info?: any;
};

export type ServiceRequestDocument = {
  field: "files";
  name: string;
  url: string;
};

type PickedFile = { uri: string; name: string; type: string };

function toPbFile(file: PickedFile) {
  return {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any;
}

async function resolveCfsServiceId(): Promise<string | null> {
  try {
    const service = await pb.collection("services").getFirstListItem<{ id: string }>(`title="CFS"`);
    return service?.id || null;
  } catch {
    return null;
  }
}

async function resolveEirCopyServiceTypeId(): Promise<string | null> {
  const serviceId = await resolveCfsServiceId();
  if (!serviceId) return null;

  const candidates = ["EIR Copy", "Eir Copy", "EIR COPY", "eir copy"];
  for (const title of candidates) {
    try {
      const rec = await pb
        .collection("sub_services")
        .getFirstListItem<{ id: string }>(`service="${serviceId}" && title="${title.replace(/\"/g, "\\\"")}"`);
      if (rec?.id) return rec.id;
    } catch {
      // try next
    }
  }

  return null;
}

export async function listEirCopyRequests(options?: PbQueryOptions): Promise<{
  success: boolean;
  message: string;
  output: CfsServiceRequestRecord[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }

    const serviceTypeId = await resolveEirCopyServiceTypeId();
    if (!serviceTypeId) {
      return { success: false, message: "EIR Copy service type not found.", output: [] };
    }

    const baseFilter = `user="${user.user.id}" && serviceType="${serviceTypeId}"`;

    const records = await pb.collection("cfs_service_requests").getFullList<CfsServiceRequestRecord>({
      ...options,
      filter: mergeFilters(baseFilter, options?.filter),
      sort: options?.sort || "-created",
      expand: options?.expand || "order,serviceType",
    });

    return { success: true, message: "Fetched EIR Copy requests.", output: records };
  } catch (err: any) {
    console.error("Error listing EIR Copy requests", err);
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status ? `Failed to fetch requests (HTTP ${status}). ${details || ""}`.trim() : details || "Failed to fetch requests.";
    return { success: false, message, output: [] };
  }
}

export async function getEirCopyRequestById(
  requestId: string,
  options?: PbQueryOptions
): Promise<{
  success: boolean;
  message: string;
  output: { request: CfsServiceRequestRecord; documents: ServiceRequestDocument[]; authHeader: string } | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }

    const id = requestId?.trim();
    if (!id) {
      return { success: false, message: "Request ID is required.", output: null };
    }

    const req = await pb.collection("cfs_service_requests").getOne<CfsServiceRequestRecord>(id, {
      ...options,
      expand: options?.expand || "order,serviceType",
    });

    if (req.user && req.user !== user.user.id) {
      return { success: false, message: "Not allowed to view this request.", output: null };
    }

    const documents: ServiceRequestDocument[] = [];
    const filenames = Array.isArray(req.files) ? req.files : [];
    filenames.filter(Boolean).forEach((name) => {
      documents.push({
        field: "files",
        name,
        url: pb.files.getURL(req as any, name, { token: pb.authStore.token }),
      });
    });

    const authHeader = pb.authStore?.token ? `Bearer ${pb.authStore.token}` : "";

    return { success: true, message: "Fetched request.", output: { request: req, documents, authHeader } };
  } catch (err: any) {
    console.error("Error fetching EIR Copy request", err);
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status ? `Failed to fetch request (HTTP ${status}). ${details || ""}`.trim() : details || "Failed to fetch request.";
    return { success: false, message, output: null };
  }
}

export async function createEirCopyRequest(params: {
  orderId: string;
  customerRemarks?: string;
  files?: PickedFile[] | null;
}): Promise<{ success: boolean; message: string; output: CfsServiceRequestRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated. Please login again.", output: null };
    }

    const orderId = params.orderId?.trim();
    if (!orderId) {
      return { success: false, message: "Order is required.", output: null };
    }

    const serviceTypeId = await resolveEirCopyServiceTypeId();
    if (!serviceTypeId) {
      return { success: false, message: "EIR Copy service type not found.", output: null };
    }

    const fd = new FormData();
    fd.append("user", user.user.id);
    fd.append("order", orderId);
    fd.append("serviceType", serviceTypeId);
    fd.append("status", "Pending");

    const remarks = params.customerRemarks?.trim();
    if (remarks) fd.append("customerRemarks", remarks);

    (params.files || []).forEach((f) => {
      if (!f) return;
      fd.append("files", toPbFile(f));
    });

    const created = await pb.collection("cfs_service_requests").create<CfsServiceRequestRecord>(fd as any);

    try {
      await createNotificationForCurrentUser({
        title: "EIR Copy Request Created",
        description: "Your EIR Copy request has been created successfully.",
        type: "event",
        ordersId: orderId,
      });
    } catch (err) {
      console.error("Error creating notification for EIR Copy request", err);
    }

    return { success: true, message: "EIR Copy request created successfully.", output: created };
  } catch (err: any) {
    console.error("Error creating EIR Copy request", err);
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status ? `Failed to create request (HTTP ${status}). ${details || ""}`.trim() : details || "Failed to create request.";
    return { success: false, message, output: null };
  }
}

export async function updateEirCopyRequest(params: {
  requestId: string;
  customerRemarks?: string;
  addFiles?: PickedFile[] | null;
}): Promise<{ success: boolean; message: string; output: CfsServiceRequestRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }

    const id = params.requestId?.trim();
    if (!id) {
      return { success: false, message: "Request ID is required.", output: null };
    }

    const existing = await pb.collection("cfs_service_requests").getOne<CfsServiceRequestRecord>(id);
    if (existing.user && existing.user !== user.user.id) {
      return { success: false, message: "Not allowed to update this request.", output: null };
    }

    const fd = new FormData();

    const remarks = params.customerRemarks?.trim();
    if (typeof remarks === "string") {
      fd.append("customerRemarks", remarks);
    }

    const existingFiles = Array.isArray(existing.files) ? existing.files : [];
    existingFiles.filter(Boolean).forEach((name) => {
      fd.append("files", name);
    });

    (params.addFiles || []).forEach((f) => {
      if (!f) return;
      fd.append("files", toPbFile(f));
    });

    const updated = await pb.collection("cfs_service_requests").update<CfsServiceRequestRecord>(id, fd as any);

    try {
      await createNotificationForCurrentUser({
        title: "EIR Copy Request Updated",
        description: "Your EIR Copy request has been updated.",
        type: "event",
        ordersId: existing.order,
      });
    } catch (err) {
      console.error("Error creating notification for EIR Copy request update", err);
    }

    return { success: true, message: "EIR Copy request updated successfully.", output: updated };
  } catch (err: any) {
    console.error("Error updating EIR Copy request", err);
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status ? `Failed to update request (HTTP ${status}). ${details || ""}`.trim() : details || "Failed to update request.";
    return { success: false, message, output: null };
  }
}

export async function deleteEirCopyRequest(requestId: string): Promise<{ success: boolean; message: string }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated." };
    }

    const id = requestId?.trim();
    if (!id) {
      return { success: false, message: "Request ID is required." };
    }

    const existing = await pb.collection("cfs_service_requests").getOne<CfsServiceRequestRecord>(id);
    if (existing.user && existing.user !== user.user.id) {
      return { success: false, message: "Not allowed to delete this request." };
    }

    await pb.collection("cfs_service_requests").delete(id);
    return { success: true, message: "EIR Copy request deleted successfully." };
  } catch (err: any) {
    console.error("Error deleting EIR Copy request", err);
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status ? `Failed to delete request (HTTP ${status}). ${details || ""}`.trim() : details || "Failed to delete request.";
    return { success: false, message };
  }
}
