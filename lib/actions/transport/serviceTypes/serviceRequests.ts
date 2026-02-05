// transport_service_requests actions (structure only)
// NOTE: This file mirrors the `transport_service_requests` collection (generic requests linked to orders + sub_services).
// TODO: Implement actual API calls using PocketBase schema fields
// TODO: Implement Transport-specific validation rules
// TODO: Implement real-time updates for transport_orders
// TODO: Implement file upload logic according to PocketBase rules
// TODO: Implement status transitions exactly as defined in backend
// TODO: Implement service-type specific business rules
// TODO: Implement filtering, search, pagination (matching webapp logic)

export type TransportServiceRequestStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";

export type TransportServiceRequestRecord = {
  id: string;
  order?: string;
  user?: string;
  serviceType?: string;
  merchantVerified?: boolean;
  merchantVerifiedBy?: string;
  golVerified?: boolean;
  golVerifiedBy?: string;
  customerRemarks?: string;
  reason?: string;
  status?: TransportServiceRequestStatus;
  created?: string;
  updated?: string;
  expand?: any;
};

export type TransportServiceRequestCreateParams = {
  order: string;
  serviceType: string;
  customerRemarks?: string;
};

export type TransportServiceRequestUpdateParams = {
  customerRemarks?: string;
};

export async function createTransportServiceRequest(params: TransportServiceRequestCreateParams): Promise<{
  success: boolean;
  message: string;
  output: TransportServiceRequestRecord | null;
}> {
  return { success: false, message: "Not implemented", output: null };
}

