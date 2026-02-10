import {
  createWarehouseRequestByServiceTypeTitle,
  getWarehouseRequestById,
  listWarehouseRequestsByServiceTypeTitle,
  updateWarehouseRequestById,
  type PickedFile,
} from "@/lib/actions/warehouse/genericServiceRequest";
import type { PbQueryOptions } from "@/lib/actions/pbOptions";

const SERVICE_TYPE_TITLE = "Container Staging";

export function listWarehouseContainerStagingRequests(options?: PbQueryOptions) {
  return listWarehouseRequestsByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, options });
}

export function getWarehouseContainerStagingRequestById(requestId: string, options?: PbQueryOptions) {
  return getWarehouseRequestById({ requestId, options });
}

export function createWarehouseContainerStagingRequest(params: {
  orderId: string;
  customerRemarks?: string;
  files?: PickedFile[] | null;
}) {
  return createWarehouseRequestByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, ...params });
}

export function updateWarehouseContainerStagingRequest(params: {
  requestId: string;
  customerRemarks?: string;
  addFiles?: PickedFile[] | null;
}) {
  return updateWarehouseRequestById({ requestId: params.requestId, customerRemarks: params.customerRemarks });
}
