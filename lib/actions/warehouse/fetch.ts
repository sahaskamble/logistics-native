import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { mergeFilters, type PbQueryOptions } from "@/lib/actions/pbOptions";
import { createNotificationForCurrentUser } from "@/lib/actions/notifications/notification";
import type { WarehouseOrderRecord } from "./createOrder";

export async function listWarehouseOrdersForCurrentUser(options?: PbQueryOptions): Promise<{
  success: boolean;
  message: string;
  output: WarehouseOrderRecord[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }
    const orders = await pb.collection("warehouse_orders").getFullList<WarehouseOrderRecord>({
      ...options,
      filter: mergeFilters(`customer="${user.user.id}"`, options?.filter),
      sort: options?.sort || "-created",
      expand: options?.expand,
    });
    return { success: true, message: "Fetched warehouse orders.", output: orders };
  } catch (err: any) {
    console.error("Error fetching warehouse orders", err);
    return { success: false, message: err?.message || "Failed to fetch warehouse orders.", output: [] };
  }
}

function escapeFilterValue(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function searchWarehouseOrdersForTrackTrace(searchTerm: string): Promise<{
  success: boolean;
  message: string;
  output: WarehouseOrderRecord[];
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
      `containers?~"${escaped}"`,
    ].join(" || ");
    return listWarehouseOrdersForCurrentUser({
      filter: `(${searchFilter})`,
      sort: "-created",
    });
  } catch (err: any) {
    console.error("Error searching warehouse orders", err);
    return { success: false, message: err?.message || "Search failed.", output: [] };
  }
}

export async function getWarehouseOrderById(
  orderId: string,
  options?: PbQueryOptions
): Promise<{ success: boolean; message: string; output: WarehouseOrderRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const order = await pb.collection("warehouse_orders").getOne<WarehouseOrderRecord>(orderId, {
      expand: options?.expand,
    });
    if (order.customer && order.customer !== user.user.id) {
      return { success: false, message: "Not allowed to view this order.", output: null };
    }
    return { success: true, message: "Fetched order.", output: order };
  } catch (err: any) {
    console.error("Error fetching warehouse order", err);
    return { success: false, message: err?.message || "Failed to fetch order.", output: null };
  }
}

export async function updateWarehouseOrder(
  orderId: string,
  data: Partial<WarehouseOrderRecord>
): Promise<{ success: boolean; message: string; output: WarehouseOrderRecord | null }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const id = orderId?.trim();
    if (!id) {
      return { success: false, message: "Order ID is required.", output: null };
    }
    const current = await pb.collection("warehouse_orders").getOne<WarehouseOrderRecord>(id);
    if (current.customer && current.customer !== user.user.id) {
      return { success: false, message: "Not allowed to update this order.", output: null };
    }
    const updated = await pb.collection("warehouse_orders").update<WarehouseOrderRecord>(id, data as any);
    try {
      await createNotificationForCurrentUser({
        title: "Warehouse Order Updated",
        description: "Your warehouse order has been updated successfully.",
        type: "event",
        ordersId: id,
      });
    } catch (err) {
      console.error("Error creating notification for warehouse order update", err);
    }
    return { success: true, message: "Warehouse order updated successfully.", output: updated };
  } catch (err: any) {
    console.error("Error updating warehouse order", err);
    return { success: false, message: err?.message || "Failed to update order.", output: null };
  }
}

export async function deleteWarehouseOrdersBulk(orderIds: string[]): Promise<{
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
          const order = await pb.collection("warehouse_orders").getOne<WarehouseOrderRecord>(id);
          if (order.customer && order.customer !== userId) {
            return { ok: false as const, id, message: "Not allowed." };
          }
          await pb.collection("warehouse_orders").delete(id);
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
    console.error("Error deleting warehouse orders", err);
    return {
      success: false,
      message: err?.message || "Failed to delete orders.",
      output: { deleted: [], failed: [] },
    };
  }
}
