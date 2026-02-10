import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { mergeFilters, type PbQueryOptions } from "@/lib/actions/pbOptions";
import { createNotificationForCurrentUser } from "@/lib/actions/notifications/notification";
import type { ThreePlOrderRecord } from "./createOrder";

export async function list3plOrdersForCurrentUser(options?: PbQueryOptions): Promise<{
  success: boolean;
  message: string;
  output: ThreePlOrderRecord[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }
    const orders = await pb.collection("3pl_orders").getFullList<ThreePlOrderRecord>({
      ...options,
      filter: mergeFilters(`customer="${user.user.id}"`, options?.filter),
      sort: options?.sort || "-created",
      expand: options?.expand,
    });
    return { success: true, message: "Fetched 3PL orders.", output: orders };
  } catch (err: any) {
    console.error("Error fetching 3PL orders", err);
    return { success: false, message: err?.message || "Failed to fetch 3PL orders.", output: [] };
  }
}

function escapeFilterValue(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function search3plOrdersForTrackTrace(searchTerm: string): Promise<{
  success: boolean;
  message: string;
  output: ThreePlOrderRecord[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }
    const term = (searchTerm || "").trim();
    if (!term) {
      return { success: false, message: "Enter Order ID, BL No, IGM No, or Item No to search.", output: [] };
    }
    const escaped = escapeFilterValue(term);
    const searchFilter = [
      `id="${escaped}"`,
      `blNo~"${escaped}"`,
      `igmNo~"${escaped}"`,
      `itemNo~"${escaped}"`,
    ].join(" || ");
    return list3plOrdersForCurrentUser({
      filter: `(${searchFilter})`,
      sort: "-created",
    });
  } catch (err: any) {
    console.error("Error searching 3PL orders", err);
    return { success: false, message: err?.message || "Search failed.", output: [] };
  }
}

export async function get3plOrderById(
  orderId: string,
  options?: PbQueryOptions
): Promise<{ success: boolean; message: string; output: ThreePlOrderRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const order = await pb.collection("3pl_orders").getOne<ThreePlOrderRecord>(orderId, {
      expand: options?.expand,
    });
    if (order.customer && order.customer !== user.user.id) {
      return { success: false, message: "Not allowed to view this order.", output: null };
    }
    return { success: true, message: "Fetched order.", output: order };
  } catch (err: any) {
    console.error("Error fetching 3PL order", err);
    return { success: false, message: err?.message || "Failed to fetch order.", output: null };
  }
}

export async function update3plOrder(
  orderId: string,
  data: Partial<ThreePlOrderRecord>
): Promise<{ success: boolean; message: string; output: ThreePlOrderRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const id = orderId?.trim();
    if (!id) {
      return { success: false, message: "Order ID is required.", output: null };
    }
    const current = await pb.collection("3pl_orders").getOne<ThreePlOrderRecord>(id);
    if (current.customer && current.customer !== user.user.id) {
      return { success: false, message: "Not allowed to update this order.", output: null };
    }
    const updated = await pb.collection("3pl_orders").update<ThreePlOrderRecord>(id, data as any);
    try {
      await createNotificationForCurrentUser({
        title: "3PL Order Updated",
        description: "Your 3PL order has been updated successfully.",
        type: "event",
        ordersId: id,
      });
    } catch (err) {
      console.error("Error creating notification for 3PL order update", err);
    }
    return { success: true, message: "3PL order updated successfully.", output: updated };
  } catch (err: any) {
    console.error("Error updating 3PL order", err);
    return { success: false, message: err?.message || "Failed to update order.", output: null };
  }
}

export async function delete3plOrdersBulk(orderIds: string[]): Promise<{
  success: boolean;
  message: string;
  output: { deleted: string[]; failed: { id: string; message: string }[] };
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: { deleted: [], failed: [] } };
    }
    const userId = user.user.id;
    const ids = Array.from(new Set((orderIds || []).map((x) => x?.trim()).filter(Boolean))) as string[];
    if (ids.length === 0) {
      return { success: false, message: "No orders selected.", output: { deleted: [], failed: [] } };
    }
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const order = await pb.collection("3pl_orders").getOne<ThreePlOrderRecord>(id);
          if (order.customer && order.customer !== userId) {
            return { ok: false as const, id, message: "Not allowed." };
          }
          await pb.collection("3pl_orders").delete(id);
          return { ok: true as const, id };
        } catch (e: any) {
          return { ok: false as const, id, message: e?.message || "Delete failed" };
        }
      })
    );
    const deleted = results.filter((r) => r.ok).map((r) => r.id);
    const failed = results.filter((r) => !r.ok).map((r) => ({ id: r.id, message: (r as any).message || "Delete failed" }));
    if (failed.length > 0) {
      return {
        success: false,
        message: `Deleted ${deleted.length} order(s). Failed to delete ${failed.length} order(s).`,
        output: { deleted, failed },
      };
    }
    return { success: true, message: `Deleted ${deleted.length} order(s).`, output: { deleted, failed: [] } };
  } catch (err: any) {
    console.error("Error deleting 3PL orders", err);
    return {
      success: false,
      message: err?.message || "Failed to delete orders.",
      output: { deleted: [], failed: [] },
    };
  }
}
