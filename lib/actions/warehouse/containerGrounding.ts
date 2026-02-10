import {
  createWarehouseRequestByServiceTypeTitle,
  getWarehouseRequestById,
  listWarehouseRequestsByServiceTypeTitle,
  updateWarehouseRequestById,
  type PickedFile,
} from "@/lib/actions/warehouse/genericServiceRequest";
import type { PbQueryOptions } from "@/lib/actions/pbOptions";

const SERVICE_TYPE_TITLE = "Container Grounding";

export function listWarehouseContainerGroundingRequests(options?: PbQueryOptions) {
  return listWarehouseRequestsByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, options });
}

export function getWarehouseContainerGroundingRequestById(requestId: string, options?: PbQueryOptions) {
  return getWarehouseRequestById({ requestId, options });
}

export function createWarehouseContainerGroundingRequest(params: {
  orderId: string;
  customerRemarks?: string;
  files?: PickedFile[] | null;
}) {
  return createWarehouseRequestByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, ...params });
}

export function updateWarehouseContainerGroundingRequest(params: {
  requestId: string;
  customerRemarks?: string;
  addFiles?: PickedFile[] | null;
}) {
  return updateWarehouseRequestById({ requestId: params.requestId, customerRemarks: params.customerRemarks });
}
