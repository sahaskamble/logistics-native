import { getEmailApiConfig } from "./config";

export type SendEmailParams = {
  /** Recipient(s). */
  to: string | string[];
  /** Subject line. */
  subject: string;
  /** HTML body. At least one of html or text is required. */
  html?: string;
  /** Plain-text body. At least one of html or text is required. */
  text?: string;
  fromEmail?: string;
  fromName?: string;
  replyToEmail?: string;
  replyToName?: string;
};

export type SendEmailResult =
  | { success: true; messageId?: string }
  | { success: false; error: string };

/**
 * Send an email via your webapp API: POST {baseUrl}/api/email/send.
 * Required: to, subject, and at least one of html or text.
 * Optional auth: x-internal-secret when INTERNAL_API_SECRET is set on the server.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, html, text } = params;
  if (!to || (Array.isArray(to) && to.length === 0)) {
    return { success: false, error: "Missing required field: to" };
  }
  if (!subject?.trim()) {
    return { success: false, error: "Missing required field: subject" };
  }
  if (!html?.trim() && !text?.trim()) {
    return { success: false, error: "Missing required field: at least one of html or text" };
  }

  const { baseUrl, internalSecret } = getEmailApiConfig();
  const url = `${baseUrl}/api/email/send`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (internalSecret) {
    headers["x-internal-secret"] = internalSecret;
  }

  const body: Record<string, unknown> = {
    to: Array.isArray(to) ? to : [to],
    subject: subject.trim(),
  };
  if (html?.trim()) body.html = html.trim();
  if (text?.trim()) body.text = text.trim();
  if (params.fromEmail) body.fromEmail = params.fromEmail;
  if (params.fromName) body.fromName = params.fromName;
  if (params.replyToEmail) body.replyToEmail = params.replyToEmail;
  if (params.replyToName) body.replyToName = params.replyToName;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = (await response.json().catch(() => ({}))) as {
      success?: boolean;
      result?: { messageId?: string };
      error?: string;
    };

    if (!response.ok) {
      const message = data?.error ?? `HTTP ${response.status}`;
      return { success: false, error: message };
    }

    if (data?.success === true) {
      return { success: true, messageId: data.result?.messageId };
    }
    return { success: false, error: data?.error ?? "Unknown error" };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Send a simple transactional email to the customer (e.g. order/service request created).
 * Best-effort: log errors but do not throw.
 */
export async function sendOrderOrRequestConfirmationEmail(options: {
  toEmail: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  try {
    const result = await sendEmail({
      to: options.toEmail,
      subject: options.subject,
      html: options.html,
      text: options.text ?? options.html.replace(/<[^>]+>/g, "").trim(),
    });
    if (!result.success) {
      console.warn("Email send failed (non-blocking):", result.error);
    }
  } catch (err) {
    console.warn("Email send error (non-blocking):", err);
  }
}
