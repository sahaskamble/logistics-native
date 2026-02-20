import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import { createNotificationForCurrentUser } from "@/lib/actions/notifications/notification";
import { sendOrderOrRequestConfirmationEmail } from "@/lib/email/send";
import { orderCreatedEmail } from "@/lib/email/templates";

export type WarehouseOrderRecord = {
  id: string;
  igmNo?: string;
  blNo?: string;
  itemNo?: string;
  consigneeName?: string;
  chaName?: string;
  provider?: string;
  customer?: string;
  status?: string;
  created?: string;
  updated?: string;
  expand?: any;
};

export type WarehouseOrderCreateParams = {
  igmNo?: string;
  blNo?: string;
  itemNo?: string;
  consigneeName?: string;
  chaName?: string;
  provider?: string;
  containers?: string[];
};

export async function createWarehouseOrder(params: WarehouseOrderCreateParams): Promise<{
  success: boolean;
  message: string;
  output: WarehouseOrderRecord | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated. Please login again.", output: null };
    }
    const data: Record<string, unknown> = {
      igmNo: (params.igmNo || "").trim() || undefined,
      blNo: (params.blNo || "").trim() || undefined,
      itemNo: (params.itemNo || "").trim() || undefined,
      consigneeName: (params.consigneeName || "").trim() || undefined,
      chaName: (params.chaName || "").trim() || undefined,
      provider: params.provider?.trim() || undefined,
      customer: user.user.id,
      status: "Pending",
      ...(Array.isArray(params.containers) && params.containers.length > 0 ? { containers: params.containers } : {}),
    };
    const created = await pb.collection("warehouse_orders").create<WarehouseOrderRecord>(data as any);
    try {
      await createNotificationForCurrentUser({
        title: "Warehouse Order Created",
        description: "Your warehouse order has been created successfully.",
        type: "event",
        ordersId: (created as any)?.id,
      });
    } catch (err) {
      console.error("Error creating notification for warehouse order", err);
    }

    const customerEmail = user.user.email;
    if (customerEmail) {
      const name = user.user.name ?? ([user.user.firstname, user.user.lastname].filter(Boolean).join(" ").trim() || undefined);
      const { subject, html, text } = orderCreatedEmail({
        orderType: "Warehouse",
        orderId: (created as any)?.id ?? "",
        customerName: name,
      });
      await sendOrderOrRequestConfirmationEmail({ toEmail: customerEmail, subject, html, text });
    }

    return { success: true, message: "Warehouse order created successfully.", output: created };
  } catch (err: any) {
    console.error("Error creating warehouse order", err);
    const details = err?.data?.message || err?.message;
    return { success: false, message: details || "Failed to create warehouse order.", output: null };
  }
}
