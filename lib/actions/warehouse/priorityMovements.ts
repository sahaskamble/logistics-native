import {
  createWarehouseRequestByServiceTypeTitle,
  getWarehouseRequestById,
  listWarehouseRequestsByServiceTypeTitle,
  updateWarehouseRequestById,
  type PickedFile,
} from "@/lib/actions/warehouse/genericServiceRequest";
import type { PbQueryOptions } from "@/lib/actions/pbOptions";

const SERVICE_TYPE_TITLE = "Priority Movements";

export function listWarehousePriorityMovementsRequests(options?: PbQueryOptions) {
  return listWarehouseRequestsByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, options });
}

export function getWarehousePriorityMovementsRequestById(requestId: string, options?: PbQueryOptions) {
  return getWarehouseRequestById({ requestId, options });
}

export function createWarehousePriorityMovementsRequest(params: {
  orderId: string;
  customerRemarks?: string;
  files?: PickedFile[] | null;
}) {
  return createWarehouseRequestByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, ...params });
}

export function updateWarehousePriorityMovementsRequest(params: {
  requestId: string;
  customerRemarks?: string;
  addFiles?: PickedFile[] | null;
}) {
  return updateWarehouseRequestById({ requestId: params.requestId, customerRemarks: params.customerRemarks });
}
