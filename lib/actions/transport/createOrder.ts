// Transport order actions (structure only)
// TODO: Implement actual API calls using PocketBase schema fields
// TODO: Implement Transport-specific validation rules
// TODO: Implement real-time updates for transport_orders
// TODO: Implement file upload logic according to PocketBase rules
// TODO: Implement status transitions exactly as defined in backend
// TODO: Implement service-type specific business rules
// TODO: Implement filtering, search, pagination (matching webapp logic)

export type TransportOrderStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "In Transit" | "Delivered";

export type TransportOrderRecord = {
  id: string;
  consigneeName?: string;
  chaName?: string;
  provider?: string;
  customer?: string;
  startDate?: string;
  startLocation?: string;
  endDate?: string;
  endLocation?: string;
  specialRequest?: string;
  vehicleDescription?: string;
  orderDescription?: string;
  createdBy?: string;
  reason?: string;
  status?: TransportOrderStatus;
  files?: string[];
  merchantVerified?: boolean;
  merchantVerifiedBy?: string;
  golVerified?: boolean;
  golVerifiedBy?: string;
  created?: string;
  updated?: string;
  expand?: any;
};

export type TransportOrderCreateParams = {
  consigneeName?: string;
  chaName?: string;
  provider?: string; // relation to service_provider
  startDate?: Date;
  startLocation?: string;
  endDate?: Date;
  endLocation?: string;
  specialRequest?: string;
  vehicleDescription?: string;
  orderDescription?: string;
  files?: Array<{ uri: string; name: string; type: string }> | null; // file field
};

export async function createTransportOrder(params: TransportOrderCreateParams): Promise<{
  success: boolean;
  message: string;
  output: TransportOrderRecord | null;
}> {
  return { success: false, message: "Not implemented", output: null };
}

