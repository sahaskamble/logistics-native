import {
  createCfsRequestByServiceTypeTitle,
  getCfsRequestById,
  listCfsRequestsByServiceTypeTitle,
  updateCfsRequestById,
  type PickedFile,
} from "@/lib/actions/cfs/genericServiceRequest";

import type { PbQueryOptions } from "@/lib/actions/pbOptions";

const SERVICE_TYPE_TITLE = "Container Staging";

export function listContainerStagingRequests(options?: PbQueryOptions) {
  return listCfsRequestsByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, options });
}

export function getContainerStagingRequestById(requestId: string, options?: PbQueryOptions) {
  return getCfsRequestById({ requestId, options });
}

export function createContainerStagingRequest(params: { orderId: string; customerRemarks?: string; files?: PickedFile[] | null }) {
  return createCfsRequestByServiceTypeTitle({ serviceTypeTitle: SERVICE_TYPE_TITLE, ...params });
}

export function updateContainerStagingRequest(params: { requestId: string; customerRemarks?: string; addFiles?: PickedFile[] | null }) {
  return updateCfsRequestById(params);
}
