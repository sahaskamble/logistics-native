import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { mergeFilters, type PbQueryOptions } from "@/lib/actions/pbOptions";

type PbBaseRecord = {
  id: string;
  created?: string;
  updated?: string;
};

type ServiceRecord = PbBaseRecord & {
  title?: string;
  description?: string;
};

type SubServiceRecord = PbBaseRecord & {
  title?: string;
  description?: string;
  service?: string;
};

export type CfsOrderRecord = PbBaseRecord & {
  status?: "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";
  customer?: string;
  orderDescription?: string;
  containers?: string[];
  blNo?: string;
  igmNo?: string;
  itemNo?: string;
  chaName?: string;
  consigneeName?: string;
  dpdType?: "DPD" | "Non-DPD";
  deliveryType?: "Loaded" | "Destuffed";
  shipping_line?: string;
  eta?: string;
  files?: string[];
  confirmShippingLine?: string;
  expand?: any;
};

type CfsServiceRequestRecord = PbBaseRecord & {
  status?: "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";
  user?: string;
  order?: string;
  serviceType?: string;
  customerRemarks?: string;
  expand?: any;
};

export type CfsOrderMovementRecord = PbBaseRecord & {
  order?: string;
  date_of_delivery?: string;
  cfs_in_time?: string;
  cfs_out_time?: string;
  remarks?: string;
  files?: string[];
  CFSIN?: boolean;
  CFSOUT?: boolean;
  expand?: any;
};

export async function getCfsServiceByTitle(serviceTitle: string): Promise<{
  success: boolean;
  message: string;
  output: ServiceRecord | null;
}> {
  try {
    const title = serviceTitle?.trim();
    if (!title) {
      return { success: false, message: "Service title is required.", output: null };
    }

    const service = await pb
      .collection("services")
      .getFirstListItem<ServiceRecord>(`title="${title.replace(/\"/g, '\\"')}"`);

    return { success: true, message: "Fetched service.", output: service };
  } catch (err: any) {
    console.error("Error fetching service", err);
    return { success: false, message: err?.message || "Failed to fetch service.", output: null };
  }
}

export async function listCfsSubServices(serviceTitle: string): Promise<{
  success: boolean;
  message: string;
  output: SubServiceRecord[];
}>;

export async function listCfsSubServices(
  serviceTitle: string,
  options?: PbQueryOptions
): Promise<{
  success: boolean;
  message: string;
  output: SubServiceRecord[];
}> {
  try {
    const serviceResult = await getCfsServiceByTitle(serviceTitle);
    if (!serviceResult.success || !serviceResult.output) {
      return { success: false, message: serviceResult.message, output: [] };
    }

    const subServices = await pb.collection("sub_services").getFullList<SubServiceRecord>({
      ...options,
      filter: mergeFilters(`service="${serviceResult.output.id}"`, options?.filter),
      sort: options?.sort || "title",
      expand: options?.expand,
    });

    return { success: true, message: "Fetched sub services.", output: subServices };
  } catch (err: any) {
    console.error("Error fetching sub services", err);
    return { success: false, message: err?.message || "Failed to fetch sub services.", output: [] };
  }
}

export async function listCfsOrdersForCurrentUser(): Promise<{
  success: boolean;
  message: string;
  output: CfsOrderRecord[];
}>;

export async function listCfsOrdersForCurrentUser(options?: PbQueryOptions): Promise<{
  success: boolean;
  message: string;
  output: CfsOrderRecord[];
}>;

export async function listCfsOrdersForCurrentUser(options?: PbQueryOptions): Promise<{
  success: boolean;
  message: string;
  output: CfsOrderRecord[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }

    const orders = await pb.collection("cfs_orders").getFullList<CfsOrderRecord>({
      ...options,
      filter: mergeFilters(`customer="${user.user.id}"`, options?.filter),
      sort: options?.sort || "-created",
      expand: options?.expand,
    });

    return { success: true, message: "Fetched CFS orders.", output: orders };
  } catch (err: any) {
    console.error("Error fetching CFS orders", err);
    return { success: false, message: err?.message || "Failed to fetch CFS orders.", output: [] };
  }
}

/** Escape a string for use inside PocketBase filter double-quoted value */
function escapeFilterValue(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Search CFS orders for track & trace by Order ID, Container ID, BL No, IGM No, or Item No.
 * Only returns orders belonging to the current user.
 */
export async function searchCfsOrdersForTrackTrace(searchTerm: string): Promise<{
  success: boolean;
  message: string;
  output: CfsOrderRecord[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }

    const term = (searchTerm || "").trim();
    if (!term) {
      return { success: false, message: "Enter Order ID, Container ID, BL No, IGM No, or Item No to search.", output: [] };
    }

    const escaped = escapeFilterValue(term);
    const searchFilter = [
      `id="${escaped}"`,
      `blNo~"${escaped}"`,
      `igmNo~"${escaped}"`,
      `itemNo~"${escaped}"`,
      `containers?~"${escaped}"`,
    ].join(" || ");

    return listCfsOrdersForCurrentUser({
      filter: `(${searchFilter})`,
      sort: "-created",
    });
  } catch (err: any) {
    console.error("Error searching CFS orders for track & trace", err);
    return { success: false, message: err?.message || "Search failed.", output: [] };
  }
}

export async function listCfsServiceRequestsByOrder(orderId: string): Promise<{
  success: boolean;
  message: string;
  output: CfsServiceRequestRecord[];
}>;

export async function listCfsServiceRequestsByOrder(
  orderId: string,
  options?: PbQueryOptions
): Promise<{
  success: boolean;
  message: string;
  output: CfsServiceRequestRecord[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }

    const order = orderId?.trim();
    if (!order) {
      return { success: false, message: "Order is required.", output: [] };
    }

    const requests = await pb
      .collection("cfs_service_requests")
      .getFullList<CfsServiceRequestRecord>({
        ...options,
        filter: mergeFilters(`order="${order}" && user="${user.user.id}"`, options?.filter),
        sort: options?.sort || "-created",
        expand: options?.expand || "serviceType",
      });

    return { success: true, message: "Fetched CFS service requests.", output: requests };
  } catch (err: any) {
    console.error("Error fetching CFS service requests", err);
    return { success: false, message: err?.message || "Failed to fetch CFS service requests.", output: [] };
  }
}

export type CfsOrderDocument = {
  field: "files" | "confirmShippingLine";
  name: string;
  url: string;
};

// export async function getCfsOrderById(orderId: string): Promise<{
//   success: boolean;
//   message: string;
//   output: { order: CfsOrderRecord; documents: CfsOrderDocument[]; authHeader: string } | null;
// }>;

export async function getCfsOrderById(
  orderId: string,
  options?: PbQueryOptions
): Promise<{
  success: boolean;
  message: string;
  output: { order: CfsOrderRecord; documents: CfsOrderDocument[]; authHeader: string } | null;
}> {
  try {
    console.log("Order-ID", orderId);
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const userId = user.user.id;

    const id = orderId?.trim();

    console.log("ID", id);

    if (!id) {
      return { success: false, message: "Order id is required.", output: null };
    }

    pb.autoCancellation(false);
    const order = await pb.collection("cfs_orders").getOne<CfsOrderRecord>(id, {
      ...options,
      expand: options?.expand || "",
    });

    // Defense-in-depth: ensure customer can only access their own orders
    if (order.customer && order.customer !== userId) {
      return { success: false, message: "Not allowed to view this order.", output: null };
    }

    const documents: CfsOrderDocument[] = [];

    const addDoc = (field: CfsOrderDocument["field"], fileName?: string | string[] | null) => {
      let filenames: string[] = [];

      if (Array.isArray(fileName)) {
        // Multi-file field (like 'files')
        filenames = fileName.filter(f => typeof f === 'string' && f.trim().length > 0);
      } else if (typeof fileName === 'string' && fileName.trim().length > 0) {
        // Single-file field with valid string
        filenames = [fileName.trim()];
      }
      // Ignore: null, undefined, "", [], [""], etc.

      filenames.forEach(name => {
        documents.push({
          field,
          name,
          url: pb.files.getURL(order as any, name, { token: pb.authStore.token }),
        });
      });
    };

    addDoc("files", order.files);
    addDoc("confirmShippingLine", order.confirmShippingLine);

    const authHeader = pb.authStore?.token ? `Bearer ${pb.authStore.token}` : "";

    return {
      success: true,
      message: "Fetched order.",
      output: { order, documents, authHeader },
    };
  } catch (err: any) {
    console.error("Error fetching CFS order", err);
    return { success: false, message: err?.message || "Failed to fetch order.", output: null };
  }
}

/**
 * List CFS order movement records for an order. Only returns movements if the order belongs to the current user.
 */
export async function listCfsOrderMovementsByOrder(
  orderId: string
): Promise<{
  success: boolean;
  message: string;
  output: CfsOrderMovementRecord[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }
    const id = orderId?.trim();
    if (!id) {
      return { success: false, message: "Order id is required.", output: [] };
    }

    const order = await pb.collection("cfs_orders").getOne<CfsOrderRecord>(id);
    if (order.customer && order.customer !== user.user.id) {
      return { success: false, message: "Not allowed to view this order.", output: [] };
    }

    const movements = await pb
      .collection("cfs_order_movement")
      .getFullList<CfsOrderMovementRecord>({
        filter: `order="${id}"`,
        sort: "created",
      });

    return { success: true, message: "Fetched movements.", output: movements };
  } catch (err: any) {
    console.error("Error fetching CFS order movements", err);
    return {
      success: false,
      message: err?.message || "Failed to fetch movements.",
      output: [],
    };
  }
}

export async function updateCfsOrder(
  orderId: string,
  data: Partial<CfsOrderRecord>
): Promise<{
  success: boolean;
  message: string;
  output: CfsOrderRecord | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const userId = user.user.id;

    const id = orderId?.trim();
    if (!id) {
      return { success: false, message: "Order ID is required.", output: null };
    }

    // Fetch current order to verify ownership
    const currentOrder = await pb.collection("cfs_orders").getOne<CfsOrderRecord>(id);

    // Only the customer (owner) can update
    if (currentOrder.customer && currentOrder.customer !== userId) {
      return { success: false, message: "Not allowed to update this order.", output: null };
    }

    // Perform update
    const updatedOrder = await pb
      .collection("cfs_orders")
      .update<CfsOrderRecord>(id, data);

    return {
      success: true,
      message: "Order updated successfully.",
      output: updatedOrder,
    };
  } catch (err: any) {
    console.error("Error updating CFS order", err);
    return {
      success: false,
      message: err?.message || "Failed to update order.",
      output: null,
    };
  }
}

export async function deleteCfsOrdersBulk(orderIds: string[]): Promise<{
  success: boolean;
  message: string;
  output: { deleted: string[]; failed: { id: string; message: string }[] };
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return {
        success: false,
        message: "User not authenticated.",
        output: { deleted: [], failed: [] },
      };
    }
    const userId = user.user.id;

    const ids = Array.from(new Set((orderIds || []).map((x) => x?.trim()).filter(Boolean))) as string[];
    if (ids.length === 0) {
      return { success: false, message: "No orders selected.", output: { deleted: [], failed: [] } };
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const order = await pb.collection("cfs_orders").getOne<CfsOrderRecord>(id);
          if (order.customer && order.customer !== userId) {
            return { ok: false as const, id, message: "Not allowed." };
          }
          await pb.collection("cfs_orders").delete(id);
          return { ok: true as const, id };
        } catch (e: any) {
          return { ok: false as const, id, message: e?.message || "Delete failed" };
        }
      })
    );

    const deleted = results.filter((r) => r.ok).map((r) => r.id);
    const failed = results
      .filter((r) => !r.ok)
      .map((r) => ({ id: r.id, message: (r as any).message || "Delete failed" }));

    if (failed.length > 0) {
      return {
        success: false,
        message: `Deleted ${deleted.length} order(s). Failed to delete ${failed.length} order(s).`,
        output: { deleted, failed },
      };
    }

    return {
      success: true,
      message: `Deleted ${deleted.length} order(s).`,
      output: { deleted, failed: [] },
    };
  } catch (err: any) {
    console.error("Error deleting CFS orders", err);
    return {
      success: false,
      message: err?.message || "Failed to delete orders.",
      output: { deleted: [], failed: [] },
    };
  }
}
