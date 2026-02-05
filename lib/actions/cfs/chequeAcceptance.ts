import {
  createCfsRequestByServiceTypeTitle,
  getCfsRequestById,
  listCfsRequestsByServiceTypeTitle,
  updateCfsRequestById,
  type PickedFile,
} from "@/lib/actions/cfs/genericServiceRequest";

import type { PbQueryOptions } from "@/lib/actions/pbOptions";

const SERVICE_TYPE_TITLE = "Cheque Acceptance";

export function listChequeAcceptanceRequests(options?: PbQueryOptions) {
  return listCfsRequestsByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, options });
}

export function getChequeAcceptanceRequestById(requestId: string, options?: PbQueryOptions) {
  return getCfsRequestById({ requestId, options });
}

export function createChequeAcceptanceRequest(params: { orderId: string; customerRemarks?: string; files?: PickedFile[] | null }) {
  return createCfsRequestByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, ...params });
}

export function updateChequeAcceptanceRequest(params: { requestId: string; customerRemarks?: string; addFiles?: PickedFile[] | null }) {
  return updateCfsRequestById(params);
}
