export { getEmailApiConfig } from "./config";
export {
  sendEmail,
  sendOrderOrRequestConfirmationEmail,
  type SendEmailParams,
  type SendEmailResult,
} from "./send";
export {
  orderCreatedEmail,
  serviceRequestCreatedEmail,
  ticketCreatedEmail,
} from "./templates";
