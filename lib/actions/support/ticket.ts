import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import type { TicketRecord } from "./types";
import type { PbQueryOptions } from "@/lib/actions/pbOptions";
import { sendOrderOrRequestConfirmationEmail } from "@/lib/email/send";
import { ticketCreatedEmail } from "@/lib/email/templates";

const COLLECTION = "ticket";

/**
 * List tickets for the current user (as customer).
 * Schema v1.2.4: ticket has customer relation. If backend listRule is empty,
 * you may need to add: customer = @request.auth.id for customers to see their tickets.
 */
export async function listTicketsForCurrentUser(options?: PbQueryOptions): Promise<{
  success: boolean;
  message: string;
  output: TicketRecord[];
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: [] };
    }
    const filter = options?.filter
      ? `customer = "${user.user.id}" && (${options.filter})`
      : `customer = "${user.user.id}"`;
    const records = await pb.collection(COLLECTION).getFullList<TicketRecord>({
      ...options,
      filter,
      sort: options?.sort ?? "-created",
      expand: options?.expand ?? "customer,assigned_to",
    });
    return { success: true, message: "Fetched tickets.", output: records };
  } catch (err: unknown) {
    const e = err as { status?: number; data?: { message?: string }; message?: string };
    const details = e?.data?.message ?? e?.message;
    const message = e?.status
      ? `Failed to fetch tickets (HTTP ${e.status}). ${details ?? ""}`.trim()
      : (details as string) ?? "Failed to fetch tickets.";
    return { success: false, message, output: [] };
  }
}

/**
 * Get a single ticket by id. Ensure backend viewRule allows customer or assigned agent.
 */
export async function getTicket(id: string, options?: { expand?: string }): Promise<{
  success: boolean;
  message: string;
  output: TicketRecord | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    const record = await pb.collection(COLLECTION).getOne<TicketRecord>(id, {
      expand: options?.expand ?? "customer,assigned_to,relatedOrderid",
    });
    return { success: true, message: "Fetched ticket.", output: record };
  } catch (err: unknown) {
    const e = err as { status?: number; data?: { message?: string }; message?: string };
    const details = e?.data?.message ?? e?.message;
    return {
      success: false,
      message: (details as string) ?? "Failed to fetch ticket.",
      output: null,
    };
  }
}

export type CreateTicketParams = {
  subject: string;
  description?: string;
  priority?: TicketRecord["priority"];
  relatedOrderid?: string;
};

/**
 * Create a support ticket. Backend createRule must allow customer = @request.auth.id.
 */
export async function createTicket(params: CreateTicketParams): Promise<{
  success: boolean;
  message: string;
  output: TicketRecord | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }
    if (!params.subject?.trim()) {
      return { success: false, message: "Subject is required.", output: null };
    }
    const record = await pb.collection(COLLECTION).create<TicketRecord>({
      customer: user.user.id,
      subject: params.subject.trim(),
      description: params.description?.trim() ?? "",
      priority: params.priority ?? "Medium",
      status: "Open",
      relatedOrderid: params.relatedOrderid?.trim() || undefined,
    } as Record<string, unknown>);

    const customerEmail = user.user.email;
    if (customerEmail) {
      const name = user.user.name ?? ([user.user.firstname, user.user.lastname].filter(Boolean).join(" ").trim() || undefined);
      const { subject, html, text } = ticketCreatedEmail({
        ticketId: record.id,
        subject: params.subject.trim(),
        customerName: name,
      });
      await sendOrderOrRequestConfirmationEmail({ toEmail: customerEmail, subject, html, text });
    }

    return { success: true, message: "Ticket created.", output: record };
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string };
    const details = e?.data?.message ?? e?.message;
    return {
      success: false,
      message: (details as string) ?? "Failed to create ticket.",
      output: null,
    };
  }
}
