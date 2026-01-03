import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";

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
  containerNo?: string;
  size?: string;
  status?: string;
  ownedBy?: string;
};

export type CfsOrderCreateParams = {
  igmNo?: string;
  blNo?: string;
  itemNo?: string;
  consigneeName?: string;
  chaName?: string;
  cfs?: string;
  dpdType?: "DPD" | "Non-DPD";
  shipping_line?: string;
  eta?: Date;
  deliveryType?: "Loaded" | "Destuffed";
  orderDescription?: string;
  containers?: string[];
  files?: { uri: string; name: string; type: string } | null;
  hblcopy?: { uri: string; name: string; type: string } | null;
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

export async function listVerifiedCfsProviders(): Promise<{
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
            filter: `verified=true && service~"${cfsServiceId}"`,
            sort: "title",
            expand: "service",
          });
        return { success: true, message: "Fetched CFS providers.", output: providers };
      } catch (err: any) {
        // Fallback to client-side filtering if the relation filter syntax differs
        console.warn("CFS provider filter fallback", err?.message || err);
      }
    }

    const allVerified = await pb.collection("service_provider").getFullList<CfsProvider>({
      filter: `verified=true`,
      sort: "title",
      expand: "service",
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

export async function listContainersForCurrentUser(): Promise<{
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
      filter: `ownedBy="${user.user.id}"`,
      sort: "-created",
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

    if (!params.dpdType) {
      return { success: false, message: "Please select DPD type.", output: null };
    }

    if (!params.deliveryType) {
      return { success: false, message: "Please select delivery type.", output: null };
    }

    if (!params.files) {
      return { success: false, message: "MBL copy (files) is required.", output: null };
    }

    const fd = new FormData();

    // Core fields
    fd.append("igmNo", (params.igmNo || "").trim());
    fd.append("blNo", (params.blNo || "").trim());
    fd.append("itemNo", (params.itemNo || "").trim());
    fd.append("consigneeName", (params.consigneeName || "").trim());
    fd.append("chaName", (params.chaName || "").trim());
    fd.append("cfs", params.cfs.trim());
    fd.append("dpdType", params.dpdType);
    fd.append("shipping_line", (params.shipping_line || "").trim());

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
    fd.append("files", toPbFile(params.files));

    if (params.hblcopy) {
      fd.append("hblcopy", toPbFile(params.hblcopy));
    }

    if (params.confirmShippingLine) {
      fd.append("confirmShippingLine", toPbFile(params.confirmShippingLine));
    }

    const created = await pb.collection("cfs_orders").create(fd as any);

    return {
      success: true,
      message: "CFS order created successfully.",
      output: created,
    };
  } catch (err: any) {
    console.error("Error creating CFS order", err);

    // PocketBase sometimes returns data.message or string
    const message =
      err?.data?.message ||
      err?.message ||
      "Failed to create CFS order. Please check inputs and try again.";

    return { success: false, message, output: null };
  }
}
