import {
  createCfsRequestByServiceTypeTitle,
  getCfsRequestById,
  listCfsRequestsByServiceTypeTitle,
  updateCfsRequestById,
  type PickedFile,
} from "@/lib/actions/cfs/genericServiceRequest";

import type { PbQueryOptions } from "@/lib/actions/pbOptions";

const SERVICE_TYPE_TITLE = "Tax Invoice";

export function listTaxInvoiceRequests(options?: PbQueryOptions) {
  return listCfsRequestsByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, options });
}

export function getTaxInvoiceRequestById(requestId: string, options?: PbQueryOptions) {
  return getCfsRequestById({ requestId, options });
}

export function createTaxInvoiceRequest(params: { orderId: string; customerRemarks?: string; files?: PickedFile[] | null }) {
  return createCfsRequestByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, ...params });
}

export function updateTaxInvoiceRequest(params: { requestId: string; customerRemarks?: string; addFiles?: PickedFile[] | null }) {
  return updateCfsRequestById(params);
}
