// transport_job_order actions (structure only)
// TODO: Implement actual API calls using PocketBase schema fields
// TODO: Implement Transport-specific validation rules
// TODO: Implement real-time updates for transport_orders
// TODO: Implement file upload logic according to PocketBase rules
// TODO: Implement status transitions exactly as defined in backend
// TODO: Implement service-type specific business rules
// TODO: Implement filtering, search, pagination (matching webapp logic)

export type TransportJobOrderStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";

export type TransportJobOrderRecord = {
  id: string;
  order?: string; // relation to transport_orders
  fromDate?: string;
  toDate?: string;
  serviceType?: string; // relation to sub_services
  vehicles?: string[]; // relation[]
  remarks?: string;
  files?: string[]; // file
  status?: TransportJobOrderStatus;
  createdBy?: string; // relation
  created?: string;
  updated?: string;
  expand?: any;
};

export type TransportJobOrderCreateParams = {
  order: string;
  fromDate?: Date;
  toDate?: Date;
  serviceType?: string;
  vehicles?: string[];
  remarks?: string;
  files?: Array<{ uri: string; name: string; type: string }> | null;
};

export type TransportJobOrderUpdateParams = {
  fromDate?: Date;
  toDate?: Date;
  remarks?: string;
  // NOTE: file update behavior depends on PB rules; will be implemented later.
};

export async function createTransportJobOrder(params: TransportJobOrderCreateParams): Promise<{
  success: boolean;
  message: string;
  output: TransportJobOrderRecord | null;
}> {
  return { success: false, message: "Not implemented", output: null };
}

export async function listTransportJobOrdersForCurrentUser(): Promise<{
  success: boolean;
  message: string;
  output: TransportJobOrderRecord[];
}> {
  return { success: false, message: "Not implemented", output: [] };
}

export async function getTransportJobOrderById(recordId: string): Promise<{
  success: boolean;
  message: string;
  output: TransportJobOrderRecord | null;
}> {
  return { success: false, message: "Not implemented", output: null };
}

export async function updateTransportJobOrderById(recordId: string, data: TransportJobOrderUpdateParams): Promise<{
  success: boolean;
  message: string;
  output: TransportJobOrderRecord | null;
}> {
  return { success: false, message: "Not implemented", output: null };
}

export async function deleteTransportJobOrderById(recordId: string): Promise<{ success: boolean; message: string }> {
  return { success: false, message: "Not implemented" };
}

