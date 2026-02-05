import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWeighmentSlipRequestById, updateWeighmentSlipRequest } from "@/lib/actions/cfs/weighmentSlip";

export default function WeighmentSlipEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Weighment Slip"
      basePath="/(protected)/cfs/weighment-slip"
      getRequestById={getWeighmentSlipRequestById}
      updateRequest={updateWeighmentSlipRequest}
    />
  );
}
