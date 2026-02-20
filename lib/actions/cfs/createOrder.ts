import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { mergeFilters, type PbQueryOptions } from "@/lib/actions/pbOptions";
import { createNotificationForCurrentUser } from "@/lib/actions/notifications/notification";
import { sendOrderOrRequestConfirmationEmail } from "@/lib/email/send";
import { orderCreatedEmail } from "@/lib/email/templates";

type PbBaseRecord = {
  id: string;
  created?: string;
  updated?: string;
  expand?: any;
};

export type CfsProvider = PbBaseRecord & {
  title?: string;
  verified?: boolean;
  service?: string[];
};

export type UserContainer = PbBaseRecord & {
  ownedBy?: string;
  containerNo?: string;
  size?: string;
  status?: "Good" | "Empty" | "Loading" | "In Transit" | "Damaged" | "Other";
  cargoType?: string;
  files?: string[];
  expand?: any;
};

export type CfsOrderCreateParams = {
  igmNo?: string;
  blNo?: string;
  itemNo?: string;
  consigneeName?: string;
  chaName?: string;
  cfs?: string;
  shipping_line?: string;
  dpdType?: "DPD" | "Non-DPD";
  eta?: Date;
  deliveryType?: "Loaded" | "Destuffed";
  orderDescription?: string;
  containers?: string[];
  files?: { uri: string; name: string; type: string }[] | null;
  confirmShippingLine?: { uri: string; name: string; type: string } | null;
};

function toPbFile(file: { uri: string; name: string; type: string }) {
  return {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any;
}

function toIsoStringOrUndefined(d?: Date) {
  if (!d) return undefined;
  const iso = d.toISOString();
  return iso;
}

export async function listVerifiedCfsProviders(options?: PbQueryOptions): Promise<{
  success: boolean;
  message: string;
  output: CfsProvider[];
}> {
  try {
    // Resolve the service id for "CFS" dynamically (no hardcoded ids)
    let cfsServiceId: string | null = null;
    try {
      const service = await pb
        .collection("services")
        .getFirstListItem<{ id: string }>(`title="CFS"`);
      cfsServiceId = service?.id || null;
    } catch {
      cfsServiceId = null;
    }

    // Prefer server-side filter when possible
    if (cfsServiceId) {
      try {
        const providers = await pb
          .collection("service_provider")
          .getFullList<CfsProvider>({
            ...options,
            filter: mergeFilters(`verified=true && service~"${cfsServiceId}"`, options?.filter),
            sort: options?.sort || "title",
            expand: options?.expand || "service",
          });
        return { success: true, message: "Fetched CFS providers.", output: providers };
      } catch (err: any) {
        // Fallback to client-side filtering if the relation filter syntax differs
        console.warn("CFS provider filter fallback", err?.message || err);
      }
    }

    const allVerified = await pb.collection("service_provider").getFullList<CfsProvider>({
      ...options,
      filter: mergeFilters(`verified=true`, options?.filter),
      sort: options?.sort || "title",
      expand: options?.expand || "service",
    });

    const filtered = allVerified.filter((p) => {
      const expandedServices = p.expand?.service;
      if (Array.isArray(expandedServices)) {
        return expandedServices.some((s: any) => (s?.title || "").toString().toLowerCase() === "cfs");
      }
      return false;
    });

    return { success: true, message: "Fetched CFS providers.", output: filtered };
  } catch (err: any) {
    console.error("Error fetching CFS providers", err);
    return { success: false, message: err?.message || "Failed to fetch CFS providers.", output: [] };
  }
}

export async function listContainersForCurrentUser(options?: PbQueryOptions): Promise<{
  success: boolean;
  message: string;
  output: UserContainer[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }

    const containers = await pb.collection("containers").getFullList<UserContainer>({
      ...options,
      filter: mergeFilters(`ownedBy="${user.user.id}"`, options?.filter),
      sort: options?.sort || "-created",
      expand: options?.expand,
    });

    return { success: true, message: "Fetched containers.", output: containers };
  } catch (err: any) {
    console.error("Error fetching containers", err);
    return { success: false, message: err?.message || "Failed to fetch containers.", output: [] };
  }
}

export async function createCfsOrder(params: CfsOrderCreateParams): Promise<{
  success: boolean;
  message: string;
  output: any | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return {
        success: false,
        message: "User not authenticated. Please login again.",
        output: null,
      };
    }

    // Minimal validation based on required business behavior
    if (!params.cfs?.trim()) {
      return { success: false, message: "Please select a CFS provider.", output: null };
    }

    if (!params.deliveryType) {
      return { success: false, message: "Please select delivery type.", output: null };
    }

    const fd = new FormData();

    // Core fields
    fd.append("igmNo", (params.igmNo || "").trim());
    fd.append("blNo", (params.blNo || "").trim());
    fd.append("itemNo", (params.itemNo || "").trim());
    fd.append("consigneeName", (params.consigneeName || "").trim());
    fd.append("chaName", (params.chaName || "").trim());
    fd.append("cfs", params.cfs.trim());
    fd.append("shipping_line", (params.shipping_line || "").trim());

    if (params.dpdType) {
      fd.append("dpdType", params.dpdType);
    }

    const eta = toIsoStringOrUndefined(params.eta);
    if (eta) fd.append("eta", eta);

    fd.append("deliveryType", params.deliveryType);
    fd.append("orderDescription", (params.orderDescription || "").trim());

    // Relations
    const containers = (params.containers || []).filter(Boolean);
    if (containers.length > 0) {
      fd.append("containers", JSON.stringify(containers));
    }

    // System/business fields
    fd.append("status", "Pending");
    fd.append("createdBy", user.user.id);
    fd.append("customer", user.user.id);

    // Files
    (params.files || []).forEach((f) => {
      if (!f) return;
      fd.append("files", toPbFile(f));
    });

    if (params.confirmShippingLine) {
      fd.append("confirmShippingLine", toPbFile(params.confirmShippingLine));
    }

    const created = await pb.collection("cfs_orders").create(fd as any);

    // Best-effort: do not fail order creation if notification fails.
    try {
      await createNotificationForCurrentUser({
        title: "CFS Order Created",
        description: `Your CFS order #${(created as any)?.id?.slice?.(0, 8) || ""} has been created successfully.`,
        type: "event",
        ordersId: (created as any)?.id,
      });
    } catch (err) {
      console.error("Error creating notification for CFS order", err);
    }

    // Best-effort: send confirmation email to customer.
    const customerEmail = user.user.email;
    if (customerEmail) {
      const name = user.user.name ?? ([user.user.firstname, user.user.lastname].filter(Boolean).join(" ").trim() || undefined);
      const { subject, html, text } = orderCreatedEmail({
        orderType: "CFS",
        orderId: (created as any)?.id ?? "",
        customerName: name,
      });
      await sendOrderOrRequestConfirmationEmail({ toEmail: customerEmail, subject, html, text });
    }

    return {
      success: true,
      message: "CFS order created successfully.",
      output: created,
    };
  } catch (err: any) {
    console.error("Error creating CFS order", err);

    // PocketBase sometimes returns data.message or string
    const status = err?.status;
    const details = err?.data?.message || err?.message;
    const message = status
      ? `Failed to create CFS order (HTTP ${status}). ${details || ""}`.trim()
      : details || "Failed to create CFS order. Please check inputs and try again.";

    return { success: false, message, output: null };
  }
}
