import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { createNotificationForCurrentUser } from "@/lib/actions/notifications/notification";
import type { TransportOrderRecord } from "./createOrder";

export type PbQueryOptions = {
  filter?: string;
  expand?: string;
  sort?: string;
  fields?: string;
  page?: number;
  perPage?: number;
};

export async function listTransportOrdersForCurrentUser(options?: PbQueryOptions): Promise<{
  success: boolean;
  message: string;
  output: TransportOrderRecord[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }
    const filter = `customer="${user.user.id}"`;
    const orders = await pb.collection("transport_orders").getFullList<TransportOrderRecord>({
      filter: options?.filter ? `(${filter}) && (${options.filter})` : filter,
      sort: options?.sort || "-created",
      expand: options?.expand,
    });
    return { success: true, message: "Fetched transport orders.", output: orders };
  } catch (err: any) {
    console.error("Error listing transport orders", err);
    return { success: false, message: err?.message || "Failed to list transport orders.", output: [] };
  }
}

export async function getTransportOrderById(orderId: string, options?: PbQueryOptions): Promise<{
  success: boolean;
  message: string;
  output: TransportOrderRecord | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const order = await pb.collection("transport_orders").getOne<TransportOrderRecord>(orderId, {
      expand: options?.expand,
    });
    if (order.customer && order.customer !== user.user.id) {
      return { success: false, message: "Not allowed to view this order.", output: null };
    }
    return { success: true, message: "Fetched order.", output: order };
  } catch (err: any) {
    console.error("Error fetching transport order", err);
    return { success: false, message: err?.message || "Failed to fetch order.", output: null };
  }
}

export async function updateTransportOrder(orderId: string, data: Partial<TransportOrderRecord>): Promise<{
  success: boolean;
  message: string;
  output: TransportOrderRecord | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const id = orderId?.trim();
    if (!id) {
      return { success: false, message: "Order ID is required.", output: null };
    }
    const current = await pb.collection("transport_orders").getOne<TransportOrderRecord>(id);
    if (current.customer && current.customer !== user.user.id) {
      return { success: false, message: "Not allowed to update this order.", output: null };
    }
    const updated = await pb.collection("transport_orders").update<TransportOrderRecord>(id, data as any);
    try {
      await createNotificationForCurrentUser({
        title: "Transport Order Updated",
        description: "Your transport order has been updated successfully.",
        type: "event",
        ordersId: id,
      });
    } catch (err) {
      console.error("Error creating notification for transport order update", err);
    }
    return { success: true, message: "Transport order updated successfully.", output: updated };
  } catch (err: any) {
    console.error("Error updating transport order", err);
    return { success: false, message: err?.message || "Failed to update order.", output: null };
  }
}

export async function deleteTransportOrder(orderId: string): Promise<{ success: boolean; message: string }> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated." };
    }
    const order = await pb.collection("transport_orders").getOne<TransportOrderRecord>(orderId);
    if (order.customer && order.customer !== user.user.id) {
      return { success: false, message: "Not allowed to delete this order." };
    }
    await pb.collection("transport_orders").delete(orderId);
    return { success: true, message: "Transport order deleted." };
  } catch (err: any) {
    console.error("Error deleting transport order", err);
    return { success: false, message: err?.message || "Failed to delete order." };
  }
}

