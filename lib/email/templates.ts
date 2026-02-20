/**
 * Simple HTML/text templates for order and service request confirmation emails.
 * Used when sending email to customer after create.
 */

const BRAND = "Link My Logistics";

function wrapHtml(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#333;max-width:600px;margin:0 auto;padding:1rem;">${body}</body></html>`;
}

export function orderCreatedEmail(options: {
  orderType: string;
  orderId: string;
  customerName?: string;
}): { subject: string; html: string; text: string } {
  const { orderType, orderId, customerName } = options;
  const subject = `${BRAND} – ${orderType} order created`;
  const greeting = customerName ? `Hi ${customerName},` : "Hi,";
  const html = wrapHtml(`
    <p>${greeting}</p>
    <p>Your <strong>${orderType}</strong> order has been created successfully.</p>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p>You can view and track this order in the app.</p>
    <p>— ${BRAND}</p>
  `);
  const text = [
    greeting,
    `Your ${orderType} order has been created successfully.`,
    `Order ID: ${orderId}`,
    "You can view and track this order in the app.",
    `— ${BRAND}`,
  ].join("\n\n");
  return { subject, html, text };
}

export function serviceRequestCreatedEmail(options: {
  serviceType: string;
  orderId?: string;
  customerName?: string;
}): { subject: string; html: string; text: string } {
  const { serviceType, orderId, customerName } = options;
  const subject = `${BRAND} – ${serviceType} request created`;
  const greeting = customerName ? `Hi ${customerName},` : "Hi,";
  const orderLine = orderId ? `<p><strong>Related order:</strong> ${orderId}</p>` : "";
  const html = wrapHtml(`
    <p>${greeting}</p>
    <p>Your <strong>${serviceType}</strong> service request has been created successfully.</p>
    ${orderLine}
    <p>We will process your request and update you in the app.</p>
    <p>— ${BRAND}</p>
  `);
  const textLines = [
    greeting,
    `Your ${serviceType} service request has been created successfully.`,
    ...(orderId ? [`Related order: ${orderId}`] : []),
    "We will process your request and update you in the app.",
    `— ${BRAND}`,
  ];
  return { subject, html, text: textLines.join("\n\n") };
}

export function ticketCreatedEmail(options: {
  ticketId: string;
  subject: string;
  customerName?: string;
}): { subject: string; html: string; text: string } {
  const { ticketId, subject: ticketSubject, customerName } = options;
  const subject = `${BRAND} – Support ticket created`;
  const greeting = customerName ? `Hi ${customerName},` : "Hi,";
  const html = wrapHtml(`
    <p>${greeting}</p>
    <p>Your support ticket has been created.</p>
    <p><strong>Ticket ID:</strong> ${ticketId}</p>
    <p><strong>Subject:</strong> ${ticketSubject || "—"}</p>
    <p>Our team will get back to you soon. You can view the ticket in the app.</p>
    <p>— ${BRAND}</p>
  `);
  const text = [
    greeting,
    "Your support ticket has been created.",
    `Ticket ID: ${ticketId}`,
    `Subject: ${ticketSubject || "—"}`,
    "Our team will get back to you soon. You can view the ticket in the app.",
    `— ${BRAND}`,
  ].join("\n\n");
  return { subject, html, text };
}
