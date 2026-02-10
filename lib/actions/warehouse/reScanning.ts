import {
  createWarehouseRequestByServiceTypeTitle,
  getWarehouseRequestById,
  listWarehouseRequestsByServiceTypeTitle,
  updateWarehouseRequestById,
  type PickedFile,
} from "@/lib/actions/warehouse/genericServiceRequest";
import type { PbQueryOptions } from "@/lib/actions/pbOptions";

const SERVICE_TYPE_TITLE = "Re-Scanning";

export function listWarehouseReScanningRequests(options?: PbQueryOptions) {
  return listWarehouseRequestsByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, options });
}

export function getWarehouseReScanningRequestById(requestId: string, options?: PbQueryOptions) {
  return getWarehouseRequestById({ requestId, options });
}

export function createWarehouseReScanningRequest(params: {
  orderId: string;
  customerRemarks?: string;
  files?: PickedFile[] | null;
}) {
  return createWarehouseRequestByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, ...params });
}

export function updateWarehouseReScanningRequest(params: {
  requestId: string;
  customerRemarks?: string;
  addFiles?: PickedFile[] | null;
}) {
  return updateWarehouseRequestById({ requestId: params.requestId, customerRemarks: params.customerRemarks });
}
