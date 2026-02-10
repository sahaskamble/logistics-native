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

export type CfsPricingRequestRecord = PbBaseRecord & {
  user?: string;
  serviceProvider?: string;
  golVerified?: boolean;
  golVerifiedBy?: string;
  containerType?: "General" | "ODC/FR/OT" | "Refer" | "Mix";
  delayType?: "DPD" | "Non-DPD";
  preferableRate?: number;
  containersPerMonth?: number;
  status?: "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";
  reason?: string;
  extra_info?: {
    twentyft?: {
      clicked?: boolean;
      preferableRate?: string;
      containersPerMonth?: string;
      freeGroundRentDays?: string;
      containerPerMonths?: string;
      agreedAmount?: string;
      billingAmount?: string;
      groundrentFreeDays?: string;
    };
    fortyft?: {
      clicked?: boolean;
      preferableRate?: string;
      containersPerMonth?: string;
      freeGroundRentDays?: string;
      containerPerMonths?: string;
      agreedAmount?: string;
      billingAmount?: string;
      groundrentFreeDays?: string;
    };
  };
};

const COLLECTION = "cfs_pricing_request";

export async function listCfsPricingRequests(options?: PbQueryOptions): Promise<{
  success: boolean;
  message: string;
  output: CfsPricingRequestRecord[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }

    const filter = mergeFilters(`user="${user.user.id}"`, options?.filter);
    const records = await pb.collection(COLLECTION).getFullList<CfsPricingRequestRecord>({
      ...options,
      filter,
      sort: options?.sort || "-created",
      expand: options?.expand || "serviceProvider",
    });

    console.log("records", records);

    return { success: true, message: "Fetched pricing requests.", output: records };
  } catch (err: any) {
    console.error("Error listing CFS pricing requests", err);
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status ? `Failed to fetch requests (HTTP ${status}). ${details || ""}`.trim() : details || "Failed to fetch requests.";
    return { success: false, message, output: [] };
  }
}

export async function getCfsPricingRequestById(
  requestId: string,
  options?: PbQueryOptions
): Promise<{ success: boolean; message: string; output: CfsPricingRequestRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }

    const id = requestId?.trim();
    if (!id) {
      return { success: false, message: "Request ID is required.", output: null };
    }

    const record = await pb.collection(COLLECTION).getOne<CfsPricingRequestRecord>(id, {
      ...options,
      expand: options?.expand || "serviceProvider",
    });

    if (record.user && record.user !== user.user.id) {
      return { success: false, message: "Not allowed to view this request.", output: null };
    }

    return { success: true, message: "Fetched request.", output: record };
  } catch (err: any) {
    console.error("Error fetching CFS pricing request", err);
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status ? `Failed to fetch request (HTTP ${status}). ${details || ""}`.trim() : details || "Failed to fetch request.";
    return { success: false, message, output: null };
  }
}

export async function updateCfsPricingRequest(params: {
  requestId: string;
  containerType?: "General" | "ODC/FR/OT" | "Refer" | "Mix";
  delayType?: "DPD" | "Non-DPD";
  reason?: string;
  extra_info?: CfsPricingRequestRecord["extra_info"];
}): Promise<{ success: boolean; message: string; output: CfsPricingRequestRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }

    const id = params.requestId?.trim();
    if (!id) {
      return { success: false, message: "Request ID is required.", output: null };
    }

    const existing = await pb.collection(COLLECTION).getOne<CfsPricingRequestRecord>(id);
    if (existing.user && existing.user !== user.user.id) {
      return { success: false, message: "Not allowed to update this request.", output: null };
    }

    const updateData: Partial<CfsPricingRequestRecord> = {};
    if (params.containerType !== undefined) updateData.containerType = params.containerType;
    if (params.delayType !== undefined) updateData.delayType = params.delayType;
    if (params.reason !== undefined) updateData.reason = params.reason;
    if (params.extra_info !== undefined) updateData.extra_info = params.extra_info;

    const updated = await pb.collection(COLLECTION).update<CfsPricingRequestRecord>(id, updateData);

    try {
      await createNotificationForCurrentUser({
        title: "Pricing Request Updated",
        description: "Your CFS pricing request has been updated.",
        type: "event",
      });
    } catch (err) {
      console.error("Error creating notification for pricing request update", err);
    }

    return { success: true, message: "Request updated successfully.", output: updated };
  } catch (err: any) {
    console.error("Error updating CFS pricing request", err);
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status ? `Failed to update request (HTTP ${status}). ${details || ""}`.trim() : details || "Failed to update request.";
    return { success: false, message, output: null };
  }
}
