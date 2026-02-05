import {
  createCfsRequestByServiceTypeTitle,
  getCfsRequestById,
  listCfsRequestsByServiceTypeTitle,
  updateCfsRequestById,
  type PickedFile,
} from "@/lib/actions/cfs/genericServiceRequest";

import type { PbQueryOptions } from "@/lib/actions/pbOptions";

const SERVICE_TYPE_TITLE = "Container Grounding";

export function listContainerGroundingRequests(options?: PbQueryOptions) {
  return listCfsRequestsByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, options });
}

export function getContainerGroundingRequestById(requestId: string, options?: PbQueryOptions) {
  return getCfsRequestById({ requestId, options });
}

export function createContainerGroundingRequest(params: { orderId: string; customerRemarks?: string; files?: PickedFile[] | null }) {
  return createCfsRequestByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, ...params });
}

export function updateContainerGroundingRequest(params: { requestId: string; customerRemarks?: string; addFiles?: PickedFile[] | null }) {
  return updateCfsRequestById(params);
}
