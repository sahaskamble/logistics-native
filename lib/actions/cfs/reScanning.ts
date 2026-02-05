import {
  createCfsRequestByServiceTypeTitle,
  getCfsRequestById,
  listCfsRequestsByServiceTypeTitle,
  updateCfsRequestById,
  type PickedFile,
} from "@/lib/actions/cfs/genericServiceRequest";

import type { PbQueryOptions } from "@/lib/actions/pbOptions";

const SERVICE_TYPE_TITLE = "Re-Scanning";

export function listReScanningRequests(options?: PbQueryOptions) {
  return listCfsRequestsByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, options });
}

export function getReScanningRequestById(requestId: string, options?: PbQueryOptions) {
  return getCfsRequestById({ requestId, options });
}

export function createReScanningRequest(params: { orderId: string; customerRemarks?: string; files?: PickedFile[] | null }) {
  return createCfsRequestByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, ...params });
}

export function updateReScanningRequest(params: { requestId: string; customerRemarks?: string; addFiles?: PickedFile[] | null }) {
  return updateCfsRequestById(params);
}
