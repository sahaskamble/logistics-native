import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";

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
  hblcopy?: string;
  confirmShippingLine?: string;
};

type CfsServiceRequestRecord = PbBaseRecord & {
  status?: "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";
  user?: string;
  order?: string;
  serviceType?: string;
  customerRemarks?: string;
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
}> {
  try {
    const serviceResult = await getCfsServiceByTitle(serviceTitle);
    if (!serviceResult.success || !serviceResult.output) {
      return { success: false, message: serviceResult.message, output: [] };
    }

    const subServices = await pb.collection("sub_services").getFullList<SubServiceRecord>({
      filter: `service="${serviceResult.output.id}"`,
      sort: "title",
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
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }

    const orders = await pb.collection("cfs_orders").getFullList<CfsOrderRecord>({
      filter: `customer="${user.user.id}"`,
      sort: "-created",
    });

    return { success: true, message: "Fetched CFS orders.", output: orders };
  } catch (err: any) {
    console.error("Error fetching CFS orders", err);
    return { success: false, message: err?.message || "Failed to fetch CFS orders.", output: [] };
  }
}

export async function listCfsServiceRequestsByOrder(orderId: string): Promise<{
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
        filter: `order="${order}" && user="${user.user.id}"`,
        sort: "-created",
        expand: "serviceType",
      });

    return { success: true, message: "Fetched CFS service requests.", output: requests };
  } catch (err: any) {
    console.error("Error fetching CFS service requests", err);
    return { success: false, message: err?.message || "Failed to fetch CFS service requests.", output: [] };
  }
}

export type CfsOrderDocument = {
  field: "files" | "hblcopy" | "confirmShippingLine";
  name: string;
  url: string;
};

export async function getCfsOrderById(orderId: string): Promise<{
  success: boolean;
  message: string;
  output: { order: CfsOrderRecord; documents: CfsOrderDocument[]; authHeader: string } | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const userId = user.user.id;

    const id = orderId?.trim();
    if (!id) {
      return { success: false, message: "Order id is required.", output: null };
    }

    const order = await pb.collection("cfs_orders").getOne<CfsOrderRecord>(id);

    // Defense-in-depth: ensure customer can only access their own orders
    if (order.customer && order.customer !== userId) {
      return { success: false, message: "Not allowed to view this order.", output: null };
    }

    const documents: CfsOrderDocument[] = [];
    const addDoc = (field: CfsOrderDocument["field"], fileName?: string) => {
      const f = (fileName || "").trim();
      if (!f) return;
      documents.push({ field, name: f, url: pb.files.getURL(order as any, f) });
    };

    if (Array.isArray(order.files)) {
      order.files.forEach((f) => addDoc("files", f));
    }
    addDoc("hblcopy", order.hblcopy);
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
